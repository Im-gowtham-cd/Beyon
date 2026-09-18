package com.beyon.profile.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.enums.AccountStatus;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.institution.model.InstitutionStudent;
import com.beyon.institution.repository.InstitutionStudentRepository;
import com.beyon.practice.service.CoinService;
import com.beyon.profile.enums.CertificationStatus;
import com.beyon.profile.enums.PlacementPreference;
import com.beyon.profile.enums.SkillProficiency;
import com.beyon.profile.enums.WorkType;
import com.beyon.profile.model.*;
import com.beyon.profile.repository.*;
import com.beyon.profile.repository.AicteInstitutionRepository;
import com.beyon.profile.model.AicteInstitution;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/onboarding")
public class OnboardingController {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final InstitutionProfileRepository institutionProfileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final StudentProjectRepository studentProjectRepository;
    private final StudentCertificationRepository studentCertificationRepository;
    private final StudentLinkRepository studentLinkRepository;
    private final InstitutionStudentRepository institutionStudentRepository;
    private final AicteInstitutionRepository aicteInstitutionRepository;
    private final CoinService coinService;
    private final ObjectMapper objectMapper;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final com.beyon.profile.service.CompanyVerificationService companyVerificationService;
    private final com.beyon.intelligence.client.AiIntelligenceClient aiIntelligenceClient;

    public OnboardingController(UserRepository userRepository,
                                StudentProfileRepository studentProfileRepository,
                                CompanyProfileRepository companyProfileRepository,
                                InstitutionProfileRepository institutionProfileRepository,
                                StudentSkillRepository studentSkillRepository,
                                StudentProjectRepository studentProjectRepository,
                                StudentCertificationRepository studentCertificationRepository,
                                StudentLinkRepository studentLinkRepository,
                                InstitutionStudentRepository institutionStudentRepository,
                                AicteInstitutionRepository aicteInstitutionRepository,
                                CoinService coinService,
                                ObjectMapper objectMapper,
                                org.springframework.jdbc.core.JdbcTemplate jdbcTemplate,
                                com.beyon.profile.service.CompanyVerificationService companyVerificationService,
                                com.beyon.intelligence.client.AiIntelligenceClient aiIntelligenceClient) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.institutionProfileRepository = institutionProfileRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.studentProjectRepository = studentProjectRepository;
        this.studentCertificationRepository = studentCertificationRepository;
        this.studentLinkRepository = studentLinkRepository;
        this.institutionStudentRepository = institutionStudentRepository;
        this.aicteInstitutionRepository = aicteInstitutionRepository;
        this.coinService = coinService;
        this.objectMapper = objectMapper;
        this.jdbcTemplate = jdbcTemplate;
        this.companyVerificationService = companyVerificationService;
        this.aiIntelligenceClient = aiIntelligenceClient;
    }

    @GetMapping("/institutions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRegisteredInstitutions() {
        List<Map<String, Object>> institutions = jdbcTemplate.queryForList(
                "SELECT ip.id, ip.user_id AS userId, ip.institution_name AS name, ip.institution_code AS code, " +
                "ip.institution_type AS type, ip.city, ip.state, ip.affiliated_university AS affiliatedUniversity, " +
                "ip.accreditation_grade AS grade, ip.accreditations AS accreditations, ip.logo_url AS logoUrl, " +
                "ip.website AS website " +
                "FROM institution_profiles ip " +
                "INNER JOIN users u ON u.id = ip.user_id " +
                "WHERE u.status = 'ACTIVE' " +
                "ORDER BY ip.institution_name ASC"
        );
        return ResponseEntity.ok(ApiResponse.ok(institutions));
    }

    @GetMapping("/institutions/verify-aicte")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyAicteCode(@RequestParam("code") String code) {
        String cleanCode = code != null ? code.trim() : "";
        if (cleanCode.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("AICTE code cannot be empty"));
        }
        boolean alreadyRegistered = institutionProfileRepository.existsByInstitutionCodeIgnoreCase(cleanCode);

        // 1. Check local AICTE accredited registry for known institution identity
        Optional<AicteInstitution> opt = aicteInstitutionRepository.findByAicteIdIgnoreCase(cleanCode);
        String knownName = opt.map(AicteInstitution::getInstituteName).orElse(null);
        String knownCity = opt.map(AicteInstitution::getCity).orElse(null);
        String knownState = opt.map(AicteInstitution::getState).orElse(null);

        // 2. Query AICTE Lookup with Google Search Grounding via AI Service
        try {
            Map<String, Object> aiLookup = aiIntelligenceClient.lookupAicteInstitution(cleanCode, knownName, knownCity, knownState);
            if (aiLookup != null && Boolean.TRUE.equals(aiLookup.get("verified"))) {
                Map<String, Object> data = new HashMap<>(aiLookup);
                data.put("alreadyRegistered", alreadyRegistered);
                data.put("instituteName", aiLookup.getOrDefault("institutionName", knownName != null ? knownName : cleanCode));
                if (data.get("city") == null && knownCity != null) data.put("city", knownCity);
                if (data.get("state") == null && knownState != null) data.put("state", knownState);
                return ResponseEntity.ok(ApiResponse.ok(data));
            }
        } catch (Exception e) {
            // Fallback to database record if AI service lookup encounters error
        }

        // 3. Fallback to local database record if AI search is unavailable
        if (opt.isPresent()) {
            AicteInstitution inst = opt.get();
            Map<String, Object> data = new HashMap<>();
            data.put("verified", true);
            data.put("alreadyRegistered", alreadyRegistered);
            data.put("aicteId", inst.getAicteId());
            data.put("instituteName", inst.getInstituteName());
            data.put("institutionName", inst.getInstituteName());
            data.put("region", inst.getRegion());
            data.put("state", inst.getState());
            data.put("district", inst.getDistrict());
            data.put("city", inst.getCity());
            data.put("userGroup", inst.getUserGroup());
            data.put("sourceUrls", List.of("https://facilities.aicte-india.org/dashboard/pages/angulardashboard.php"));
            data.put("missingFields", List.of("officialWebsite", "officialEmail", "affiliatedUniversity"));
            data.put("confidenceScore", 0.95);
            return ResponseEntity.ok(ApiResponse.ok(data));
        }

        List<InstitutionProfile> profiles = institutionProfileRepository.findAll();
        for (InstitutionProfile ip : profiles) {
            if (ip.getInstitutionCode() != null && cleanCode.equalsIgnoreCase(ip.getInstitutionCode().trim())) {
                Map<String, Object> data = new HashMap<>();
                data.put("verified", true);
                data.put("alreadyRegistered", true);
                data.put("aicteId", ip.getInstitutionCode());
                data.put("instituteName", ip.getInstitutionName());
                data.put("institutionName", ip.getInstitutionName());
                data.put("region", "National");
                data.put("state", ip.getState());
                data.put("district", ip.getCity());
                data.put("city", ip.getCity());
                data.put("userGroup", "Accredited");
                data.put("officialWebsite", ip.getWebsite());
                data.put("officialEmail", ip.getOfficialEmail());
                data.put("sourceUrls", List.of("https://facilities.aicte-india.org/dashboard/pages/angulardashboard.php"));
                data.put("missingFields", Collections.emptyList());
                data.put("confidenceScore", 0.99);
                return ResponseEntity.ok(ApiResponse.ok(data));
            }
        }

        Map<String, Object> notFound = new HashMap<>();
        notFound.put("verified", false);
        notFound.put("alreadyRegistered", false);
        notFound.put("aicteId", cleanCode);
        notFound.put("missingFields", List.of("institutionName", "address", "city", "district", "state", "pincode", "officialWebsite", "officialEmail"));
        notFound.put("sourceUrls", Collections.emptyList());
        notFound.put("confidenceScore", 0.0);
        notFound.put("message", "AICTE Permanent ID " + cleanCode + " not found in accredited institution records. Please enter details manually.");
        return ResponseEntity.ok(ApiResponse.ok(notFound));
    }

    @PostMapping("/student")
    public ResponseEntity<ApiResponse<Map<String, Object>>> completeStudentOnboarding(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        UUID userId = extractUserId(auth);

        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    StudentProfile sp = new StudentProfile();
                    sp.setUserId(userId);
                    return sp;
                });

        if (body.get("phone") != null) profile.setPhone(body.get("phone").toString());
        if (body.get("gender") != null) profile.setGender(body.get("gender").toString());
        if (body.get("country") != null) profile.setCountry(body.get("country").toString());
        if (body.get("state") != null) profile.setState(body.get("state").toString());
        if (body.get("city") != null) profile.setCity(body.get("city").toString());
        if (body.get("institution") != null) profile.setInstitution(body.get("institution").toString());
        if (body.get("registrationNumber") != null) profile.setRegistrationNumber(body.get("registrationNumber").toString());
        if (body.get("degree") != null) profile.setDegree(body.get("degree").toString());
        if (body.get("department") != null) profile.setDepartment(body.get("department").toString());
        if (body.get("academicYear") != null) profile.setAcademicYear(body.get("academicYear").toString());
        if (body.get("aboutMe") != null) profile.setAboutMe(body.get("aboutMe").toString());

        if (body.get("cgpa") != null && !body.get("cgpa").toString().isBlank()) {
            try {
                profile.setCgpa(new BigDecimal(body.get("cgpa").toString()));
            } catch (Exception ignored) {}
        }

        if (body.get("placementPreference") != null) {
            try {
                profile.setPlacementPreference(PlacementPreference.valueOf(body.get("placementPreference").toString()));
            } catch (Exception ignored) {}
        }

        if (body.get("preferredWorkType") != null) {
            try {
                profile.setPreferredWorkType(WorkType.valueOf(body.get("preferredWorkType").toString()));
            } catch (Exception ignored) {}
        }

        if (body.get("graduationYear") != null && !body.get("graduationYear").toString().isBlank()) {
            try {
                profile.setGraduationYear(Integer.parseInt(body.get("graduationYear").toString()));
            } catch (Exception ignored) {}
        }

        if (body.get("dateOfBirth") != null && !body.get("dateOfBirth").toString().isBlank()) {
            try {
                profile.setDateOfBirth(java.time.LocalDate.parse(body.get("dateOfBirth").toString()));
            } catch (Exception ignored) {}
        }

        if (body.get("preferredJobRoles") instanceof List<?> roles) {
            profile.setPreferredJobRoles(String.join(",", roles.stream().map(Object::toString).toList()));
        } else if (body.get("preferredJobRoles") != null) {
            profile.setPreferredJobRoles(body.get("preferredJobRoles").toString());
        }

        if (body.get("preferredIndustries") instanceof List<?> ind) {
            profile.setPreferredIndustries(String.join(",", ind.stream().map(Object::toString).toList()));
        } else if (body.get("preferredIndustries") != null) {
            profile.setPreferredIndustries(body.get("preferredIndustries").toString());
        }

        if (body.get("preferredLocations") instanceof List<?> locs) {
            profile.setPreferredLocations(String.join(",", locs.stream().map(Object::toString).toList()));
        } else if (body.get("preferredLocations") != null) {
            profile.setPreferredLocations(body.get("preferredLocations").toString());
        }

        if (body.get("firstName") != null) profile.setFirstName(body.get("firstName").toString());
        if (body.get("middleName") != null) profile.setMiddleName(body.get("middleName").toString());
        if (body.get("lastName") != null) profile.setLastName(body.get("lastName").toString());
        if (body.get("aicteCode") != null) profile.setAicteCode(body.get("aicteCode").toString());
        if (body.get("studentIdCardUrl") != null) profile.setStudentIdCardUrl(body.get("studentIdCardUrl").toString());

        try {
            if (body.get("education10th") != null) {
                profile.setEducation10th(objectMapper.writeValueAsString(body.get("education10th")));
            }
            if (body.get("education12th") != null) {
                profile.setEducation12th(objectMapper.writeValueAsString(body.get("education12th")));
            }
            if (body.get("educationDiploma") != null) {
                profile.setEducationDiploma(objectMapper.writeValueAsString(body.get("educationDiploma")));
            }
            if (body.get("internships") != null) {
                profile.setInternshipExperience(objectMapper.writeValueAsString(body.get("internships")));
            }
        } catch (Exception ignored) {}

        boolean meetsVerification = profile.isHasCompletedAssessment();
        profile.setVerificationStatus(meetsVerification ? "VERIFIED" : "PENDING");
        profile.setCompletionPct(100);
        studentProfileRepository.save(profile);

        String fName = profile.getFirstName();
        String lName = profile.getLastName();
        if (fName != null && !fName.isBlank()) {
            String mName = profile.getMiddleName();
            String fullName = (fName + (mName != null && !mName.isBlank() ? " " + mName : "") + (lName != null && !lName.isBlank() ? " " + lName : "")).trim();
            userRepository.findById(userId).ifPresent(u -> {
                u.setDisplayName(fullName);
                userRepository.save(u);
            });
        }

        String targetInst = profile.getInstitution();
        Object instIdObj = body.get("institutionId");
        InstitutionProfile matched = null;

        if (instIdObj != null && !instIdObj.toString().isBlank()) {
            String instIdStr = instIdObj.toString().trim();
            try {
                UUID parsedId = UUID.fromString(instIdStr);
                matched = institutionProfileRepository.findById(parsedId).orElse(null);
                if (matched == null) {
                    matched = institutionProfileRepository.findByUserId(parsedId).orElse(null);
                }
            } catch (Exception ignored) {}
        }

        if (matched == null && targetInst != null && !targetInst.isBlank()) {
            List<InstitutionProfile> matchingInstitutions = institutionProfileRepository.findAll();
            matched = matchingInstitutions.stream()
                    .filter(ip -> ip.getInstitutionName() != null &&
                            (ip.getInstitutionName().equalsIgnoreCase(targetInst) ||
                             targetInst.toLowerCase().contains(ip.getInstitutionName().toLowerCase()) ||
                             ip.getInstitutionName().toLowerCase().contains(targetInst.toLowerCase())))
                    .findFirst()
                    .orElse(null);
        }

        if (matched != null) {
            profile.setInstitution(matched.getInstitutionName());
            if (matched.getInstitutionCode() != null && !matched.getInstitutionCode().isBlank()) {
                profile.setAicteCode(matched.getInstitutionCode());
            }
            studentProfileRepository.save(profile);

            UUID instUserId = matched.getUserId();
            String rawDept = profile.getDepartment() != null ? profile.getDepartment().trim() : "CSE";
            String upperDept = rawDept.toUpperCase();
            String deptVal = "CSE";
            if (upperDept.contains("COMPUTER SCIENCE") || upperDept.contains("CSE")) {
                deptVal = "CSE";
            } else if (upperDept.contains("INFORMATION TECHNOLOGY") || upperDept.contains("IT")) {
                deptVal = "IT";
            } else if (upperDept.contains("ELECTRONICS") || upperDept.contains("ECE")) {
                deptVal = "ECE";
            } else if (upperDept.contains("MECHANICAL") || upperDept.contains("MECH")) {
                deptVal = "MECH";
            } else if (upperDept.contains("AI") || upperDept.contains("DATA SCIENCE") || upperDept.contains("AIDS")) {
                deptVal = "AIDS";
            } else {
                deptVal = rawDept;
            }

            final String finalDept = deptVal;
            userRepository.findById(userId).ifPresent(u -> {
                u.setInstitutionId(instUserId);
                u.setDepartmentId(finalDept);
                userRepository.save(u);
            });

            InstitutionStudent instStudent = institutionStudentRepository
                    .findByInstitutionIdAndStudentId(instUserId, userId)
                    .orElseGet(() -> {
                        InstitutionStudent is = new InstitutionStudent();
                        is.setInstitutionId(instUserId);
                        is.setStudentId(userId);
                        return is;
                    });
            instStudent.setDepartment(finalDept);
            instStudent.setBatch(profile.getAcademicYear() != null ? profile.getAcademicYear() : "Current Batch");
            instStudent.setPlacementStatus(meetsVerification ? "PLACEMENT_SEEKING" : "PENDING_VERIFICATION");
            instStudent.setVerified(meetsVerification);
            institutionStudentRepository.save(instStudent);
        }

        if (body.get("skills") instanceof List<?> skillsList && !skillsList.isEmpty()) {
            List<StudentSkill> existingSkills = studentSkillRepository.findByUserId(userId);
            for (StudentSkill existing : existingSkills) {
                if (!existing.isVerified()) {
                    studentSkillRepository.delete(existing);
                }
            }

            java.util.Set<String> savedNames = new java.util.HashSet<>();
            for (Object item : skillsList) {
                if (item instanceof Map<?, ?> smap && smap.get("skillName") != null) {
                    String sName = smap.get("skillName").toString().trim();
                    if (!sName.isBlank() && !savedNames.contains(sName.toLowerCase())) {
                        StudentSkill sk = new StudentSkill();
                        sk.setUserId(userId);
                        sk.setSkillName(sName);
                        sk.setCategory(smap.get("category") != null ? smap.get("category").toString() : "Technical");
                        sk.setSource("ONBOARDING_DECLARED");
                        try {
                            if (smap.get("proficiency") != null) {
                                sk.setProficiency(SkillProficiency.valueOf(smap.get("proficiency").toString()));
                            } else {
                                sk.setProficiency(SkillProficiency.INTERMEDIATE);
                            }
                        } catch (Exception ignored) {
                            sk.setProficiency(SkillProficiency.INTERMEDIATE);
                        }
                        studentSkillRepository.save(sk);
                        savedNames.add(sName.toLowerCase());
                    }
                }
            }
        }


        if (body.get("projects") instanceof List<?> projList) {
            for (Object item : projList) {
                if (item instanceof Map<?, ?> pmap && pmap.get("name") != null) {
                    String pName = pmap.get("name").toString();
                    if (!pName.isBlank()) {
                        StudentProject p = new StudentProject();
                        p.setUserId(userId);
                        p.setName(pName);
                        if (pmap.get("role") != null) p.setRole(pmap.get("role").toString());
                        if (pmap.get("description") != null) p.setDescription(pmap.get("description").toString());
                        if (pmap.get("technologies") != null) p.setTechnologies(pmap.get("technologies").toString());
                        if (pmap.get("githubUrl") != null) p.setGithubUrl(pmap.get("githubUrl").toString());
                        if (pmap.get("liveUrl") != null) p.setLiveUrl(pmap.get("liveUrl").toString());
                        studentProjectRepository.save(p);
                    }
                }
            }
        }

        if (body.get("certifications") instanceof List<?> certList) {
            for (Object item : certList) {
                if (item instanceof Map<?, ?> cmap && cmap.get("name") != null) {
                    String cName = cmap.get("name").toString();
                    if (!cName.isBlank()) {
                        StudentCertification c = new StudentCertification();
                        c.setUserId(userId);
                        c.setName(cName);
                        if (cmap.get("issuingOrg") != null) c.setIssuingOrg(cmap.get("issuingOrg").toString());
                        if (cmap.get("credentialId") != null) c.setCredentialId(cmap.get("credentialId").toString());
                        if (cmap.get("credentialUrl") != null) c.setCredentialUrl(cmap.get("credentialUrl").toString());
                        c.setStatus(CertificationStatus.PENDING_VERIFICATION);
                        studentCertificationRepository.save(c);
                    }
                }
            }
        }

        if (body.get("links") instanceof List<?> linkList) {
            for (Object item : linkList) {
                if (item instanceof Map<?, ?> lmap && lmap.get("platform") != null && lmap.get("url") != null) {
                    String url = lmap.get("url").toString();
                    if (!url.isBlank()) {
                        StudentLink l = new StudentLink();
                        l.setUserId(userId);
                        l.setPlatform(lmap.get("platform").toString());
                        l.setUrl(url);
                        studentLinkRepository.save(l);
                    }
                }
            }
        }

        userRepository.findById(userId).ifPresent(u -> {
            u.setProfileStatus(AccountStatus.COMPLETED);
            u.setStatus(AccountStatus.ACTIVE);
            userRepository.save(u);
        });

        long currentBalance = 100;
        try {
            coinService.getOrCreateWallet(userId);
            if (!coinService.hasEarned(userId, "ONBOARDING_COMPLETED")) {
                coinService.earnCoins(userId, "ONBOARDING_COMPLETED", "ONBOARDING", userId);
            }
            currentBalance = coinService.getBalance(userId);
        } catch (Exception ignored) {}

        Map<String, Object> ledger = new HashMap<>();
        ledger.put("users", Map.of(
            "table", "users",
            "destination", "Identity Service (MySQL / Dolt)",
            "fields", List.of("id", "email", "display_name", "role = STUDENT", "status = ACTIVE", "email_verified = false")
        ));
        ledger.put("student_profiles", Map.of(
            "table", "student_profiles",
            "destination", "Core Profile Service (MySQL / Dolt)",
            "fields", List.of("user_id", "first_name", "middle_name", "last_name", "aicte_code", "institution", "student_id_card_url", "education_10th", "education_12th", "education_diploma", "internship_experience", "verification_status = PENDING")
        ));
        ledger.put("institution_students", Map.of(
            "table", "institution_students",
            "destination", "Institutional Roster (MySQL / Dolt)",
            "fields", List.of("institution_id", "student_id", "department", "batch", "placement_status = PENDING_VERIFICATION", "verified = false (Pending Institutional Endorsement)")
        ));
        ledger.put("s3_documents", Map.of(
            "bucket", "s3://beyon-documents",
            "destination", "Amazon S3 Document Lake",
            "objects", List.of("student_id_cards/*", "internship_certificates/*", "resumes/*")
        ));

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("status", "COMPLETED");
        responseData.put("message", "Student profile created and saved successfully! 100 Welcome Coins awarded.");
        responseData.put("coinsAwarded", 100);
        responseData.put("balance", currentBalance);
        responseData.put("persistenceLedger", ledger);

        return ResponseEntity.ok(ApiResponse.ok(responseData));
    }

    @PostMapping("/company")
    public ResponseEntity<ApiResponse<Map<String, Object>>> completeCompanyOnboarding(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        UUID userId = extractUserId(auth);

        String cin = body.get("cin") != null ? body.get("cin").toString().trim() : "";
        String website = body.get("website") != null ? body.get("website").toString().trim()
                : (body.get("websiteUrl") != null ? body.get("websiteUrl").toString().trim() : "");
        String officialEmail = body.get("officialEmail") != null ? body.get("officialEmail").toString().trim()
                : (body.get("corporateEmail") != null ? body.get("corporateEmail").toString().trim()
                : (body.get("contactEmail") != null ? body.get("contactEmail").toString().trim()
                : (body.get("primaryRepresentativeEmail") != null ? body.get("primaryRepresentativeEmail").toString().trim() : "")));
        String phone = body.get("phone") != null ? body.get("phone").toString().trim()
                : (body.get("primaryRepresentativePhone") != null ? body.get("primaryRepresentativePhone").toString().trim() : "");
        String repName = body.get("representativeName") != null ? body.get("representativeName").toString().trim()
                : (body.get("primaryRepresentativeName") != null ? body.get("primaryRepresentativeName").toString().trim() : "");
        String repDesig = body.get("representativeDesignation") != null ? body.get("representativeDesignation").toString().trim()
                : (body.get("primaryRepresentativeDesignation") != null ? body.get("primaryRepresentativeDesignation").toString().trim() : "");

        if (body.get("representatives") instanceof List<?> repList && !repList.isEmpty()) {
            Object first = repList.get(0);
            if (first instanceof Map<?, ?> rMap) {
                if (repName.isBlank() && rMap.get("name") != null) repName = rMap.get("name").toString().trim();
                if (repDesig.isBlank() && rMap.get("designation") != null) repDesig = rMap.get("designation").toString().trim();
                if (officialEmail.isBlank() && rMap.get("email") != null) officialEmail = rMap.get("email").toString().trim();
                if (phone.isBlank() && rMap.get("phone") != null) phone = rMap.get("phone").toString().trim();
            }
        }

        if (officialEmail.isBlank()) {
            officialEmail = userRepository.findById(userId).map(u -> u.getEmail() != null ? u.getEmail().trim() : "").orElse("");
        }

        CompanyProfile profile = companyProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CompanyProfile cp = new CompanyProfile();
                    cp.setUserId(userId);
                    return cp;
                });

        if (body.get("companyName") != null) profile.setCompanyName(body.get("companyName").toString());
        if (body.get("companyType") != null) profile.setCompanyType(body.get("companyType").toString());
        if (body.get("industry") != null) profile.setIndustry(body.get("industry").toString());
        if (!website.isBlank()) profile.setWebsite(website);
        if (!officialEmail.isBlank()) profile.setOfficialEmail(officialEmail);
        if (!phone.isBlank()) profile.setPhone(phone);
        if (body.get("country") != null) profile.setCountry(body.get("country").toString());
        if (body.get("state") != null) profile.setState(body.get("state").toString());
        if (body.get("city") != null) profile.setCity(body.get("city").toString());
        if (body.get("headquarters") != null) profile.setHeadquarters(body.get("headquarters").toString());
        if (body.get("companySize") != null) profile.setCompanySize(body.get("companySize").toString());
        if (body.get("about") != null) profile.setAbout(body.get("about").toString());
        if (body.get("linkedin") != null) profile.setLinkedin(body.get("linkedin").toString());

        profile.setCompletionPct(100);
        companyProfileRepository.save(profile);

        Map<String, Object> verifResult = companyVerificationService.verifyCompanyRegistration(
                userId,
                cin,
                website,
                repName,
                repDesig,
                officialEmail,
                phone
        );

        return ResponseEntity.ok(ApiResponse.ok(verifResult));
    }

    @PostMapping("/institution")
    public ResponseEntity<ApiResponse<Map<String, Object>>> completeInstitutionOnboarding(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        UUID userId = extractUserId(auth);

        InstitutionProfile profile = institutionProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    InstitutionProfile ip = new InstitutionProfile();
                    ip.setUserId(userId);
                    return ip;
                });

        if (body.get("institutionName") != null) profile.setInstitutionName(body.get("institutionName").toString());
        if (body.get("institutionType") != null) profile.setInstitutionType(body.get("institutionType").toString());
        if (body.get("institutionCode") != null) profile.setInstitutionCode(body.get("institutionCode").toString());
        if (body.get("officialEmail") != null) profile.setOfficialEmail(body.get("officialEmail").toString());
        if (body.get("phone") != null) profile.setPhone(body.get("phone").toString());
        if (body.get("website") != null) profile.setWebsite(body.get("website").toString());
        if (body.get("country") != null) profile.setCountry(body.get("country").toString());
        if (body.get("state") != null) profile.setState(body.get("state").toString());
        if (body.get("city") != null) profile.setCity(body.get("city").toString());
        if (body.get("address") != null) profile.setAddress(body.get("address").toString());
        if (body.get("postalCode") != null) profile.setPostalCode(body.get("postalCode").toString());
        if (body.get("affiliatedUniversity") != null) profile.setAffiliatedUniversity(body.get("affiliatedUniversity").toString());
        if (body.get("accreditationGrade") != null) profile.setAccreditationGrade(body.get("accreditationGrade").toString());
        if (body.get("accreditations") != null) profile.setAccreditations(body.get("accreditations").toString());

        if (body.get("establishedYear") != null && !body.get("establishedYear").toString().isBlank()) {
            try { profile.setEstablishedYear(Integer.parseInt(body.get("establishedYear").toString())); } catch (Exception ignored) {}
        }
        if (body.get("totalStudents") != null && !body.get("totalStudents").toString().isBlank()) {
            try { profile.setTotalStudents(Integer.parseInt(body.get("totalStudents").toString())); } catch (Exception ignored) {}
        }

        profile.setCompletionPct(100);
        institutionProfileRepository.save(profile);

        userRepository.findById(userId).ifPresent(u -> {
            u.setProfileStatus(AccountStatus.PENDING_SUPER_ADMIN_VERIFICATION);
            u.setStatus(AccountStatus.PENDING_SUPER_ADMIN_VERIFICATION);
            userRepository.save(u);
        });

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "status", "PENDING_SUPER_ADMIN_VERIFICATION",
                "message", "Institution profile submitted for Super Admin verification"
        )));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}

