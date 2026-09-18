package com.beyon.profile.service;

import com.beyon.common.exception.ForbiddenException;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.identity.enums.AccountStatus;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.profile.model.*;
import com.beyon.profile.repository.*;
import com.beyon.profile.util.DomainExtractor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class CompanyVerificationService {

    private static final Logger log = LoggerFactory.getLogger(CompanyVerificationService.class);

    // Standard 21-character CIN regex
    private static final Pattern CIN_PATTERN = Pattern.compile("^([LUlu])([0-9]{5})([A-Za-z]{2})([0-9]{4})([A-Za-z]{3})([0-9]{6})$");

    private final McaCompanyMasterRepository mcaRepo;
    private final EmailDomainBlacklistRepository blacklistRepo;
    private final CompanyVerificationRepository verificationRepo;
    private final CompanyVerificationCheckRepository checkRepo;
    private final VerificationAuditLogRepository auditRepo;
    private final CompanyProfileRepository companyProfileRepo;
    private final UserRepository userRepo;

    public CompanyVerificationService(
            McaCompanyMasterRepository mcaRepo,
            EmailDomainBlacklistRepository blacklistRepo,
            CompanyVerificationRepository verificationRepo,
            CompanyVerificationCheckRepository checkRepo,
            VerificationAuditLogRepository auditRepo,
            CompanyProfileRepository companyProfileRepo,
            UserRepository userRepo) {
        this.mcaRepo = mcaRepo;
        this.blacklistRepo = blacklistRepo;
        this.verificationRepo = verificationRepo;
        this.checkRepo = checkRepo;
        this.auditRepo = auditRepo;
        this.companyProfileRepo = companyProfileRepo;
        this.userRepo = userRepo;
    }

    public boolean isCompanyVerified(UUID userId) {
        if (userId == null) return false;
        return verificationRepo.findByUserId(userId.toString())
                .map(v -> "VERIFIED".equalsIgnoreCase(v.getOverallStatus()))
                .orElse(false);
    }

    public boolean isCinAlreadyRegistered(String cin) {
        if (cin == null || cin.isBlank()) return false;
        String cleanCin = cin.trim().toUpperCase();
        return companyProfileRepo.existsByCinIgnoreCase(cleanCin) || verificationRepo.existsByCinIgnoreCase(cleanCin);
    }

    public void enforceCompanyVerified(UUID userId) {
        if (!isCompanyVerified(userId)) {
            throw new ForbiddenException("Access restricted: Completed company genuineness and representative verification is required to publish opportunities or recruitment drives.");
        }
    }

    @Transactional
    public Map<String, Object> verifyCompanyRegistration(
            UUID userId,
            String cin,
            String officialWebsite,
            String representativeName,
            String representativeDesignation,
            String corporateEmail,
            String phone) {

        String cleanCin = cin != null ? cin.trim().toUpperCase() : "";
        String cleanWebsite = officialWebsite != null ? officialWebsite.trim() : "";
        String cleanEmail = corporateEmail != null ? corporateEmail.trim().toLowerCase() : "";
        String cleanRepName = representativeName != null ? representativeName.trim() : "";
        String cleanRepDesig = representativeDesignation != null ? representativeDesignation.trim() : "";
        String cleanPhone = phone != null ? phone.trim() : "";

        List<CompanyVerificationCheck> checks = new ArrayList<>();
        List<String> failureReasons = new ArrayList<>();

        // Check 1: CIN Format Validation
        boolean cinFormatPass = CIN_PATTERN.matcher(cleanCin).matches();
        String cinCheckDetails = cinFormatPass
                ? "Valid 21-character CIN structure: " + cleanCin
                : "Invalid CIN structure. Standard 21-character structure required (e.g. U72900KA1981PLC004246).";
        checks.add(new CompanyVerificationCheck(UUID.randomUUID().toString(), null, "CIN_FORMAT_CHECK", cinFormatPass ? "PASS" : "FAIL", cinCheckDetails));
        if (!cinFormatPass) {
            failureReasons.add("Invalid 21-character CIN format");
        }

        // Check 2: MCA Company Master Lookup
        McaCompanyMaster mcaRecord = null;
        if (cinFormatPass) {
            mcaRecord = mcaRepo.findByCinIgnoreCase(cleanCin)
                    .orElseGet(() -> lookupAndCacheFromCsv(cleanCin));
        }

        boolean mcaPass = (mcaRecord != null);
        String mcaDetails = mcaPass
                ? "Company found in MCA Master: " + mcaRecord.getCompanyName() + " (" + mcaRecord.getCompanyState() + ")"
                : "CIN not found in MCA company master database.";
        checks.add(new CompanyVerificationCheck(UUID.randomUUID().toString(), null, "MCA_CIN_CHECK", mcaPass ? "PASS" : "FAIL", mcaDetails));
        if (!mcaPass) {
            failureReasons.add("CIN not found in MCA company master data");
        }

        // Check 3: Company Status Validation
        boolean statusPass = false;
        String statusDetails = "Company status evaluation skipped due to missing MCA record.";
        if (mcaRecord != null) {
            String cStatus = mcaRecord.getCompanyStatus() != null ? mcaRecord.getCompanyStatus().trim() : "";
            statusPass = "Active".equalsIgnoreCase(cStatus);
            statusDetails = statusPass
                    ? "MCA legal status is Active."
                    : "Company is legally inactive. Status in MCA registry: " + cStatus + ".";
            if (!statusPass) {
                failureReasons.add("Company status is legally inactive: " + cStatus);
            }
        }
        checks.add(new CompanyVerificationCheck(UUID.randomUUID().toString(), null, "COMPANY_STATUS_CHECK", statusPass ? "PASS" : "FAIL", statusDetails));

        // Check 4: Public / Disposable Email Filter
        String emailHost = cleanEmail.contains("@") ? cleanEmail.split("@")[1].trim() : "";
        String emailRootDomain = DomainExtractor.extractRootDomainFromEmail(cleanEmail);
        boolean isBlacklisted = false;
        if (!emailHost.isEmpty()) {
            isBlacklisted = blacklistRepo.existsByDomainIgnoreCaseAndIsActiveTrue(emailHost)
                    || (emailRootDomain != null && blacklistRepo.existsByDomainIgnoreCaseAndIsActiveTrue(emailRootDomain));
        }
        boolean emailProviderPass = !isBlacklisted && !emailHost.isEmpty();
        String emailProviderDetails = emailProviderPass
                ? "Corporate domain verified (" + emailHost + "). No public/disposable provider detected."
                : "Public or disposable email provider detected (" + emailHost + "). Official corporate domain required.";
        checks.add(new CompanyVerificationCheck(UUID.randomUUID().toString(), null, "EMAIL_PROVIDER_CHECK", emailProviderPass ? "PASS" : "FAIL", emailProviderDetails));
        if (!emailProviderPass) {
            failureReasons.add("Public or personal email provider detected (" + emailHost + ")");
        }

        // Check 5: Website Domain Extraction
        String webRootDomain = DomainExtractor.extractRootDomainFromUrl(cleanWebsite);
        boolean webDomainPass = (webRootDomain != null && !webRootDomain.isEmpty());
        String webDomainDetails = webDomainPass
                ? "Successfully extracted website root domain: " + webRootDomain
                : "Unable to parse registrable root domain from official website URL.";
        checks.add(new CompanyVerificationCheck(UUID.randomUUID().toString(), null, "WEBSITE_DOMAIN_CHECK", webDomainPass ? "PASS" : "FAIL", webDomainDetails));
        if (!webDomainPass) {
            failureReasons.add("Invalid or unparseable website URL");
        }

        // Check 6: Corporate Email Domain Extraction
        boolean emailDomainPass = (emailRootDomain != null && !emailRootDomain.isEmpty());
        String emailDomainDetails = emailDomainPass
                ? "Successfully extracted corporate email root domain: " + emailRootDomain
                : "Unable to parse root domain from corporate email address.";
        checks.add(new CompanyVerificationCheck(UUID.randomUUID().toString(), null, "EMAIL_DOMAIN_CHECK", emailDomainPass ? "PASS" : "FAIL", emailDomainDetails));
        if (!emailDomainPass) {
            failureReasons.add("Invalid corporate email format");
        }

        // Check 7: Website <-> Email Domain Match
        boolean domainMatchPass = false;
        String domainMatchDetails;
        if (webDomainPass && emailDomainPass) {
            domainMatchPass = webRootDomain.equalsIgnoreCase(emailRootDomain);
            domainMatchDetails = domainMatchPass
                    ? "Domain match verified: Official website (" + webRootDomain + ") matches corporate email domain (" + emailRootDomain + ")."
                    : "Domain mismatch: Website domain (" + webRootDomain + ") does not match corporate email domain (" + emailRootDomain + "). Sent for Manual Review.";
            if (!domainMatchPass) {
                failureReasons.add("Website domain (" + webRootDomain + ") and email domain (" + emailRootDomain + ") do not match");
            }
        } else {
            domainMatchDetails = "Domain match could not be evaluated due to missing website or email root domain.";
            failureReasons.add("Domain matching could not be evaluated");
        }
        checks.add(new CompanyVerificationCheck(UUID.randomUUID().toString(), null, "DOMAIN_MATCH_CHECK", domainMatchPass ? "PASS" : "FAIL", domainMatchDetails));

        // Determine Overall Verification Status
        String overallStatus;
        if (!cinFormatPass) {
            overallStatus = "CIN_INVALID";
        } else if (!mcaPass) {
            overallStatus = "CIN_NOT_FOUND";
        } else if (!statusPass) {
            overallStatus = "COMPANY_INACTIVE";
        } else if (!emailProviderPass) {
            overallStatus = "PUBLIC_EMAIL";
        } else if (!domainMatchPass) {
            overallStatus = "DOMAIN_MISMATCH";
        } else {
            overallStatus = "VERIFIED";
        }

        // Resolve CompanyProfile
        CompanyProfile companyProfile = companyProfileRepo.findByUserId(userId)
                .orElseGet(() -> {
                    CompanyProfile cp = new CompanyProfile();
                    cp.setUserId(userId);
                    return cp;
                });

        String legalName = mcaRecord != null ? mcaRecord.getCompanyName() : (companyProfile.getCompanyName() != null ? companyProfile.getCompanyName() : cleanCin);
        companyProfile.setCin(cleanCin);
        companyProfile.setCompanyName(legalName);
        companyProfile.setWebsite(cleanWebsite);
        companyProfile.setOfficialEmail(cleanEmail);
        companyProfile.setPhone(cleanPhone);
        companyProfile.setVerificationStatus(overallStatus);
        companyProfile.setCompletionPct(100);
        if (mcaRecord != null) {
            if (mcaRecord.getCompanyState() != null) companyProfile.setState(mcaRecord.getCompanyState());
            if (mcaRecord.getCompanyCategory() != null) companyProfile.setCompanyType(mcaRecord.getCompanyCategory());
            if (mcaRecord.getCompanyAddress() != null) companyProfile.setHeadquarters(mcaRecord.getCompanyAddress());
        }
        companyProfileRepo.save(companyProfile);

        // Update User account status
        userRepo.findById(userId).ifPresent(u -> {
            u.setStatus(AccountStatus.ACTIVE);
            u.setProfileStatus(AccountStatus.COMPLETED);
            userRepo.save(u);
        });

        // Persist CompanyVerification
        CompanyVerification verification = verificationRepo.findByUserId(userId.toString())
                .orElseGet(() -> {
                    CompanyVerification cv = new CompanyVerification();
                    cv.setId(UUID.randomUUID().toString());
                    cv.setUserId(userId.toString());
                    return cv;
                });

        verification.setCompanyId(companyProfile.getId() != null ? companyProfile.getId().toString() : userId.toString());
        verification.setCin(cleanCin);
        verification.setLegalName(legalName);
        verification.setCompanyStatus(mcaRecord != null ? mcaRecord.getCompanyStatus() : "UNKNOWN");
        verification.setOfficialWebsite(cleanWebsite);
        verification.setNormalizedWebsiteDomain(webRootDomain != null ? webRootDomain : "");
        verification.setCorporateEmail(cleanEmail);
        verification.setNormalizedEmailDomain(emailRootDomain != null ? emailRootDomain : "");
        verification.setRepresentativeName(cleanRepName);
        verification.setRepresentativeDesignation(cleanRepDesig);
        verification.setRepresentativePhone(cleanPhone);
        verification.setOverallStatus(overallStatus);
        verification.setFailureReasons(String.join("; ", failureReasons));
        verificationRepo.save(verification);

        // Save individual check rows
        checkRepo.deleteByVerificationId(verification.getId());
        for (CompanyVerificationCheck c : checks) {
            c.setVerificationId(verification.getId());
            checkRepo.save(c);
        }

        // Persist Audit Log
        VerificationAuditLog audit = new VerificationAuditLog();
        audit.setId(UUID.randomUUID().toString());
        audit.setCompanyId(verification.getCompanyId());
        audit.setUserId(userId.toString());
        audit.setVerificationId(verification.getId());
        audit.setAction("VERIFIED".equals(overallStatus) ? "AUTO_VERIFIED" : "REGISTRATION_SUBMITTED");
        audit.setResult(overallStatus);
        audit.setActorId(userId.toString());
        audit.setActorRole("SYSTEM");
        audit.setFailureReason(String.join("; ", failureReasons));
        audit.setChecksSummary("CIN=" + (cinFormatPass ? "PASS" : "FAIL")
                + ", MCA=" + (mcaPass ? "PASS" : "FAIL")
                + ", STATUS=" + (statusPass ? "PASS" : "FAIL")
                + ", EMAIL_PROVIDER=" + (emailProviderPass ? "PASS" : "FAIL")
                + ", WEB_DOMAIN=" + (webDomainPass ? "PASS" : "FAIL")
                + ", EMAIL_DOMAIN=" + (emailDomainPass ? "PASS" : "FAIL")
                + ", DOMAIN_MATCH=" + (domainMatchPass ? "PASS" : "FAIL"));
        auditRepo.save(audit);

        // Prepare response payload
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("overallStatus", overallStatus);
        response.put("isVerified", "VERIFIED".equals(overallStatus));
        response.put("legalName", legalName);
        response.put("cin", cleanCin);
        response.put("websiteDomain", webRootDomain);
        response.put("emailDomain", emailRootDomain);
        response.put("failureReasons", failureReasons);
        response.put("checks", checks);

        return response;
    }

    public Map<String, Object> getVerificationStatus(UUID userId) {
        CompanyVerification verification = verificationRepo.findByUserId(userId.toString())
                .orElse(null);

        Map<String, Object> result = new LinkedHashMap<>();
        if (verification == null) {
            result.put("overallStatus", "PENDING");
            result.put("isVerified", false);
            result.put("checks", Collections.emptyList());
            return result;
        }

        List<CompanyVerificationCheck> checks = checkRepo.findByVerificationIdOrderByCreatedAtAsc(verification.getId());
        result.put("overallStatus", verification.getOverallStatus());
        result.put("isVerified", "VERIFIED".equalsIgnoreCase(verification.getOverallStatus()));
        result.put("legalName", verification.getLegalName());
        result.put("cin", verification.getCin());
        result.put("website", verification.getOfficialWebsite());
        result.put("websiteDomain", verification.getNormalizedWebsiteDomain());
        result.put("corporateEmail", verification.getCorporateEmail());
        result.put("emailDomain", verification.getNormalizedEmailDomain());
        result.put("representativeName", verification.getRepresentativeName());
        result.put("representativeDesignation", verification.getRepresentativeDesignation());
        result.put("failureReasons", verification.getFailureReasons());
        result.put("reviewNotes", verification.getReviewNotes());
        result.put("checks", checks);
        return result;
    }

    @Transactional
    public void approveVerification(UUID adminId, UUID targetUserId, String notes) {
        CompanyVerification verification = verificationRepo.findByUserId(targetUserId.toString())
                .orElseThrow(() -> new ResourceNotFoundException("Verification record not found for user: " + targetUserId));

        verification.setOverallStatus("VERIFIED");
        verification.setReviewedBy(adminId != null ? adminId.toString() : "SUPER_ADMIN");
        verification.setReviewedAt(Instant.now());
        verification.setReviewNotes(notes);
        verificationRepo.save(verification);

        userRepo.findById(targetUserId).ifPresent(u -> {
            u.setStatus(AccountStatus.ACTIVE);
            u.setProfileStatus(AccountStatus.COMPLETED);
            userRepo.save(u);
        });

        companyProfileRepo.findByUserId(targetUserId).ifPresent(cp -> {
            cp.setVerificationStatus("VERIFIED");
            companyProfileRepo.save(cp);
        });

        VerificationAuditLog logEntry = new VerificationAuditLog();
        logEntry.setId(UUID.randomUUID().toString());
        logEntry.setCompanyId(verification.getCompanyId());
        logEntry.setUserId(targetUserId.toString());
        logEntry.setVerificationId(verification.getId());
        logEntry.setAction("ADMIN_APPROVED");
        logEntry.setResult("VERIFIED");
        logEntry.setActorId(adminId != null ? adminId.toString() : "SUPER_ADMIN");
        logEntry.setActorRole("SUPER_ADMIN");
        logEntry.setReviewNotes(notes);
        auditRepo.save(logEntry);
    }

    @Transactional
    public void rejectVerification(UUID adminId, UUID targetUserId, String reason) {
        CompanyVerification verification = verificationRepo.findByUserId(targetUserId.toString())
                .orElseThrow(() -> new ResourceNotFoundException("Verification record not found for user: " + targetUserId));

        verification.setOverallStatus("REJECTED");
        verification.setReviewedBy(adminId != null ? adminId.toString() : "SUPER_ADMIN");
        verification.setReviewedAt(Instant.now());
        verification.setReviewNotes(reason);
        verificationRepo.save(verification);

        userRepo.findById(targetUserId).ifPresent(u -> {
            u.setStatus(AccountStatus.REJECTED);
            u.setProfileStatus(AccountStatus.REJECTED);
            userRepo.save(u);
        });

        companyProfileRepo.findByUserId(targetUserId).ifPresent(cp -> {
            cp.setVerificationStatus("REJECTED");
            companyProfileRepo.save(cp);
        });

        VerificationAuditLog logEntry = new VerificationAuditLog();
        logEntry.setId(UUID.randomUUID().toString());
        logEntry.setCompanyId(verification.getCompanyId());
        logEntry.setUserId(targetUserId.toString());
        logEntry.setVerificationId(verification.getId());
        logEntry.setAction("ADMIN_REJECTED");
        logEntry.setResult("REJECTED");
        logEntry.setActorId(adminId != null ? adminId.toString() : "SUPER_ADMIN");
        logEntry.setActorRole("SUPER_ADMIN");
        logEntry.setFailureReason(reason);
        auditRepo.save(logEntry);
    }

    @Transactional
    public void requestAdditionalDocuments(UUID adminId, UUID targetUserId, String notes) {
        CompanyVerification verification = verificationRepo.findByUserId(targetUserId.toString())
                .orElseThrow(() -> new ResourceNotFoundException("Verification record not found for user: " + targetUserId));

        verification.setOverallStatus("MANUAL_REVIEW_DOCS_REQUESTED");
        verification.setReviewedBy(adminId != null ? adminId.toString() : "SUPER_ADMIN");
        verification.setReviewedAt(Instant.now());
        verification.setReviewNotes(notes);
        verificationRepo.save(verification);

        VerificationAuditLog logEntry = new VerificationAuditLog();
        logEntry.setId(UUID.randomUUID().toString());
        logEntry.setCompanyId(verification.getCompanyId());
        logEntry.setUserId(targetUserId.toString());
        logEntry.setVerificationId(verification.getId());
        logEntry.setAction("DOCUMENTS_REQUESTED");
        logEntry.setResult("MANUAL_REVIEW_DOCS_REQUESTED");
        logEntry.setActorId(adminId != null ? adminId.toString() : "SUPER_ADMIN");
        logEntry.setActorRole("SUPER_ADMIN");
        logEntry.setReviewNotes(notes);
        auditRepo.save(logEntry);
    }

    @Transactional
    public void suspendCompany(UUID adminId, UUID targetUserId, String reason) {
        CompanyVerification verification = verificationRepo.findByUserId(targetUserId.toString())
                .orElseThrow(() -> new ResourceNotFoundException("Verification record not found for user: " + targetUserId));

        verification.setOverallStatus("SUSPENDED");
        verification.setReviewedBy(adminId != null ? adminId.toString() : "SUPER_ADMIN");
        verification.setReviewedAt(Instant.now());
        verification.setReviewNotes(reason);
        verificationRepo.save(verification);

        userRepo.findById(targetUserId).ifPresent(u -> {
            u.setStatus(AccountStatus.DEACTIVATED);
            userRepo.save(u);
        });

        companyProfileRepo.findByUserId(targetUserId).ifPresent(cp -> {
            cp.setVerificationStatus("SUSPENDED");
            companyProfileRepo.save(cp);
        });

        VerificationAuditLog logEntry = new VerificationAuditLog();
        logEntry.setId(UUID.randomUUID().toString());
        logEntry.setCompanyId(verification.getCompanyId());
        logEntry.setUserId(targetUserId.toString());
        logEntry.setVerificationId(verification.getId());
        logEntry.setAction("ACCOUNT_SUSPENDED");
        logEntry.setResult("SUSPENDED");
        logEntry.setActorId(adminId != null ? adminId.toString() : "SUPER_ADMIN");
        logEntry.setActorRole("SUPER_ADMIN");
        logEntry.setFailureReason(reason);
        auditRepo.save(logEntry);
    }

    public Optional<McaCompanyMaster> findOrLookupMca(String cin) {
        if (cin == null || cin.isBlank()) return Optional.empty();
        String cleanCin = cin.trim().toUpperCase();
        if (!CIN_PATTERN.matcher(cleanCin).matches()) {
            return Optional.empty();
        }
        Optional<McaCompanyMaster> opt = mcaRepo.findByCinIgnoreCase(cleanCin);
        if (opt.isPresent()) return opt;
        McaCompanyMaster fromCsv = lookupAndCacheFromCsv(cleanCin);
        return Optional.ofNullable(fromCsv);
    }

    private McaCompanyMaster lookupAndCacheFromCsv(String cin) {
        String[] csvFiles = {
                "dataset/Company/company_master_data_2026-09-12_part1.csv",
                "dataset/Company/company_master_data_2026-09-12_part2.csv",
                "dataset/Company/company_master_data_2026-09-12_part3.csv",
                "dataset/Company/company_master_data_2026-09-12_part4.csv"
        };

        for (String relativePath : csvFiles) {
            File f = new File(relativePath);
            if (!f.exists()) {
                f = new File("d:/SIH/26044/" + relativePath);
            }
            if (!f.exists()) continue;

            try (BufferedReader br = new BufferedReader(new FileReader(f))) {
                String line;
                while ((line = br.readLine()) != null) {
                    if (line.startsWith(cin + ",") || line.startsWith("\"" + cin + "\",")) {
                        String[] cols = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                        if (cols.length >= 13) {
                            McaCompanyMaster mca = new McaCompanyMaster();
                            mca.setId(UUID.randomUUID().toString());
                            mca.setCin(cin);
                            mca.setCompanyName(cleanCsvValue(cols[1]));
                            mca.setCompanyRegistrationDate(cleanCsvValue(cols[2]));
                            mca.setCompanyCategory(cleanCsvValue(cols[3]));
                            mca.setCompanyClass(cleanCsvValue(cols[4]));
                            mca.setListingStatus(cleanCsvValue(cols[5]));
                            try {
                                mca.setAuthorizedCapital(new java.math.BigDecimal(cleanCsvValue(cols[6])));
                            } catch (Exception ignored) {}
                            try {
                                mca.setPaidupCapital(new java.math.BigDecimal(cleanCsvValue(cols[7])));
                            } catch (Exception ignored) {}
                            mca.setCompanyRoc(cleanCsvValue(cols[8]));
                            mca.setCompanyAddress(cleanCsvValue(cols[9]));
                            mca.setPinCode(cleanCsvValue(cols[10]));
                            mca.setCompanyState(cleanCsvValue(cols[11]));
                            mca.setCompanyStatus(cleanCsvValue(cols[12]));
                            if (cols.length > 13) mca.setCompanySubCategory(cleanCsvValue(cols[13]));
                            if (cols.length > 14) mca.setCompanyIndustrialClassification(cleanCsvValue(cols[14]));

                            mcaRepo.save(mca);
                            log.info("Cached MCA record into MySQL from dataset CSV: {} -> {}", cin, mca.getCompanyName());
                            return mca;
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Error reading dataset file {}: {}", relativePath, e.getMessage());
            }
        }
        return null;
    }

    private String cleanCsvValue(String val) {
        if (val == null) return "";
        return val.replaceAll("^\"|\"$", "").trim();
    }
}
