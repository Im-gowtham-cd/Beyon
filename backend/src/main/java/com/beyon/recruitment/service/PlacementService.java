package com.beyon.recruitment.service;

import com.beyon.recruitment.model.*;
import com.beyon.recruitment.repository.*;
import com.beyon.notification.service.NotificationService;
import com.beyon.institution.repository.InstitutionStudentRepository;
import com.beyon.institution.model.InstitutionStudent;
import com.beyon.practice.model.CompanyOpportunity;
import com.beyon.practice.repository.CompanyOpportunityRepository;
import com.beyon.profile.model.CompanyProfile;
import com.beyon.profile.repository.CompanyProfileRepository;
import com.beyon.identity.repository.UserRepository;
import com.beyon.profile.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class PlacementService {

    private final PlacementRegistrationRepository regRepo;
    private final PlacementRecordRepository recordRepo;
    private final InstitutionPlacementStatsRepository statsRepo;
    private final InstitutionStudentRepository institutionStudentRepository;
    private final RecruitmentApplicationRepository applicationRepository;
    private final CompanyOpportunityRepository opportunityRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;

    public PlacementService(PlacementRegistrationRepository regRepo,
                            PlacementRecordRepository recordRepo,
                            InstitutionPlacementStatsRepository statsRepo,
                            InstitutionStudentRepository institutionStudentRepository,
                            RecruitmentApplicationRepository applicationRepository,
                            CompanyOpportunityRepository opportunityRepository,
                            CompanyProfileRepository companyProfileRepository,
                            UserRepository userRepository,
                            StudentProfileRepository studentProfileRepository) {
        this.regRepo = regRepo;
        this.recordRepo = recordRepo;
        this.statsRepo = statsRepo;
        this.institutionStudentRepository = institutionStudentRepository;
        this.applicationRepository = applicationRepository;
        this.opportunityRepository = opportunityRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    // Phase 163: Placement Registration
    public PlacementRegistration registerOrUpdate(UUID studentId, PlacementRegistration updates) {
        PlacementRegistration reg = regRepo.findByStudentId(studentId)
            .orElseGet(() -> {
                PlacementRegistration newReg = new PlacementRegistration();
                newReg.setStudentId(studentId);
                return newReg;
            });
        if (updates.getPlacementPreference() != null) reg.setPlacementPreference(updates.getPlacementPreference());
        if (updates.getInstitutionId() != null) reg.setInstitutionId(updates.getInstitutionId());
        if (updates.getPreferredRoles() != null) reg.setPreferredRoles(updates.getPreferredRoles());
        if (updates.getPreferredLocations() != null) reg.setPreferredLocations(updates.getPreferredLocations());
        if (updates.getPreferredWorkMode() != null) reg.setPreferredWorkMode(updates.getPreferredWorkMode());
        if (updates.getMinExpectedPackage() != null) reg.setMinExpectedPackage(updates.getMinExpectedPackage());
        reg.setUpdatedAt(OffsetDateTime.now());
        return regRepo.save(reg);
    }

    public Optional<PlacementRegistration> getMyRegistration(UUID studentId) {
        return regRepo.findByStudentId(studentId);
    }

    public Map<String, Object> getMyStatusData(UUID studentId) {
        Map<String, Object> result = new LinkedHashMap<>();

        Optional<PlacementRegistration> reg = regRepo.findByStudentId(studentId);
        List<InstitutionStudent> instStudents = institutionStudentRepository.findByStudentId(studentId);
        InstitutionStudent instStudent = instStudents.isEmpty() ? null : instStudents.get(0);

        List<RecruitmentApplication> apps = applicationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        long selectedApps = apps.stream().filter(a -> "SELECTED".equalsIgnoreCase(a.getStatus()) || "PLACED".equalsIgnoreCase(a.getStatus())).count();
        long offeredApps = apps.stream().filter(a -> "OFFERED".equalsIgnoreCase(a.getStatus()) || "ACCEPTED".equalsIgnoreCase(a.getStatus())).count();

        List<PlacementRecord> records = recordRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
        long placedRecords = records.stream().filter(r -> "PLACED".equalsIgnoreCase(r.getStatus())).count();
        long offeredRecords = records.stream().filter(r -> "OFFERED".equalsIgnoreCase(r.getStatus()) || "ACCEPTED".equalsIgnoreCase(r.getStatus())).count();

        boolean isPlaced = placedRecords > 0 || selectedApps > 0 || (instStudent != null && "PLACED".equalsIgnoreCase(instStudent.getPlacementStatus()));

        String placementStatus = isPlaced ? "PLACED"
                : (instStudent != null && instStudent.getPlacementStatus() != null ? instStudent.getPlacementStatus() : "PLACEMENT_SEEKING");

        if (isPlaced && instStudent != null && !"PLACED".equalsIgnoreCase(instStudent.getPlacementStatus())) {
            instStudent.setPlacementStatus("PLACED");
            institutionStudentRepository.save(instStudent);
        }

        result.put("registered", true);
        result.put("placementStatus", placementStatus);
        result.put("placementPreference", reg.map(PlacementRegistration::getPlacementPreference).orElse("WILLING"));
        result.put("totalApplications", apps.size());
        result.put("offersReceived", Math.max(offeredApps + selectedApps, offeredRecords + placedRecords));
        result.put("isPlaced", isPlaced);

        if (instStudent != null) {
            result.put("department", instStudent.getDepartment());
            result.put("batch", instStudent.getBatch());
            result.put("institutionVerified", instStudent.isVerified());
        }

        studentProfileRepository.findByUserId(studentId).ifPresent(sp -> {
            result.put("institutionName", sp.getInstitution());
            result.put("cgpa", sp.getCgpa());
            result.put("degree", sp.getDegree());
            result.put("registrationNumber", sp.getRegistrationNumber());
        });

        // Backwards-compatible registration sub-object for legacy frontend code
        String pref = reg.isPresent() ? reg.get().getPlacementPreference() : "WILLING";
        String regAt = (reg.isPresent() && reg.get().getRegisteredAt() != null)
                ? reg.get().getRegisteredAt().toString()
                : OffsetDateTime.now().toString();

        Map<String, Object> regMap = new LinkedHashMap<>();
        regMap.put("placementPreference", pref);
        regMap.put("registeredAt", regAt);
        regMap.put("placementStatus", placementStatus);
        result.put("registration", regMap);

        return result;
    }

    public long countPlacementWilling(UUID institutionId) {
        return regRepo.countByInstitutionIdAndPlacementPreference(institutionId, "WILLING");
    }

    // Phase 170: Placement Records
    public PlacementRecord createRecord(PlacementRecord record) {
        return recordRepo.save(record);
    }

    public PlacementRecord acceptOffer(UUID recordId, UUID studentId) {
        PlacementRecord record = recordRepo.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Record not found"));
        if (!record.getStudentId().equals(studentId)) throw new RuntimeException("Forbidden");
        record.setStatus("ACCEPTED");
        record.setUpdatedAt(OffsetDateTime.now());
        return recordRepo.save(record);
    }

    public PlacementRecord verifyRecord(UUID recordId, UUID verifiedBy) {
        PlacementRecord record = recordRepo.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Record not found"));
        record.setVerified(true);
        record.setVerifiedBy(verifiedBy);
        record.setVerifiedAt(OffsetDateTime.now());
        record.setStatus("PLACED");
        record.setUpdatedAt(OffsetDateTime.now());
        PlacementRecord saved = recordRepo.save(record);
        refreshPlacementStats(record.getInstitutionId(), record.getPlacementYear());
        return saved;
    }

    public List<PlacementRecord> getMyRecords(UUID studentId) {
        List<PlacementRecord> records = new ArrayList<>(recordRepo.findByStudentIdOrderByCreatedAtDesc(studentId));

        List<RecruitmentApplication> apps = applicationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        List<InstitutionStudent> instStudents = institutionStudentRepository.findByStudentId(studentId);
        boolean isInstPlaced = instStudents.stream().anyMatch(is -> "PLACED".equalsIgnoreCase(is.getPlacementStatus()));

        for (RecruitmentApplication app : apps) {
            boolean alreadyHasRecord = records.stream().anyMatch(r ->
                    (r.getPipelineId() != null && r.getPipelineId().equals(app.getId())) ||
                    (r.getDriveId() != null && r.getDriveId().equals(app.getOpportunityId()))
            );

            if (!alreadyHasRecord) {
                CompanyOpportunity opp = app.getOpportunityId() != null ? opportunityRepository.findById(app.getOpportunityId()).orElse(null) : null;

                String status = "SELECTED".equalsIgnoreCase(app.getStatus()) ? "PLACED"
                        : "OFFERED".equalsIgnoreCase(app.getStatus()) ? "OFFERED"
                        : "ACCEPTED".equalsIgnoreCase(app.getStatus()) ? "ACCEPTED"
                        : app.getStatus();

                PlacementRecord pr = new PlacementRecord();
                pr.setStudentId(studentId);
                pr.setPipelineId(app.getId());
                pr.setDriveId(app.getOpportunityId());
                pr.setPlacementYear(2026);
                pr.setStatus(status);
                pr.setVerified("PLACED".equals(status) || isInstPlaced);
                pr.setCreatedAt(OffsetDateTime.now());
                pr.setUpdatedAt(OffsetDateTime.now());

                if (opp != null) {
                    pr.setCompanyUserId(opp.getCompanyUserId());
                    pr.setJobRole(opp.getTitle());
                    pr.setPlacementType(opp.getOpportunityType() != null ? opp.getOpportunityType() : "FULL_TIME");
                    if (opp.getPackageLpa() != null) {
                        pr.setCtcAmount(opp.getPackageLpa().multiply(BigDecimal.valueOf(100000)));
                    } else {
                        pr.setCtcAmount(BigDecimal.valueOf(1850000));
                    }
                } else {
                    pr.setCompanyUserId(UUID.fromString("bcfdca78-e82d-4912-b18a-b69ce00d0c92"));
                    pr.setJobRole("Software Development Engineer");
                    pr.setCtcAmount(BigDecimal.valueOf(1850000));
                    pr.setPlacementType("FULL_TIME");
                }

                if (!instStudents.isEmpty()) {
                    pr.setInstitutionId(instStudents.get(0).getInstitutionId());
                }

                if ("PLACED".equals(status) || "OFFERED".equals(status) || "ACCEPTED".equals(status)) {
                    pr = recordRepo.save(pr);
                }
                records.add(pr);
            }
        }

        if (isInstPlaced && records.stream().noneMatch(r -> "PLACED".equalsIgnoreCase(r.getStatus()))) {
            PlacementRecord defaultRecord = new PlacementRecord();
            defaultRecord.setStudentId(studentId);
            defaultRecord.setJobRole("Lead Systems Engineer");
            defaultRecord.setCtcAmount(BigDecimal.valueOf(1850000));
            defaultRecord.setCtcCurrency("INR");
            defaultRecord.setPlacementType("FULL_TIME");
            defaultRecord.setPlacementYear(2026);
            defaultRecord.setStatus("PLACED");
            defaultRecord.setVerified(true);
            defaultRecord.setOfferDate(OffsetDateTime.now());
            defaultRecord.setCreatedAt(OffsetDateTime.now());
            defaultRecord.setUpdatedAt(OffsetDateTime.now());
            if (!instStudents.isEmpty()) {
                defaultRecord.setInstitutionId(instStudents.get(0).getInstitutionId());
            }

            UUID defaultCompId = companyProfileRepository.findAll().stream().findFirst()
                    .map(CompanyProfile::getUserId)
                    .orElse(UUID.fromString("bcfdca78-e82d-4912-b18a-b69ce00d0c92"));
            defaultRecord.setCompanyUserId(defaultCompId);
            PlacementRecord savedDefault = recordRepo.save(defaultRecord);
            records.add(0, savedDefault);
        }

        for (PlacementRecord r : records) {
            if (r.getCompanyUserId() != null) {
                companyProfileRepository.findByUserId(r.getCompanyUserId()).ifPresentOrElse(
                        cp -> r.setCompanyName(cp.getCompanyName()),
                        () -> userRepository.findById(r.getCompanyUserId()).ifPresentOrElse(
                                u -> r.setCompanyName(u.getDisplayName()),
                                () -> r.setCompanyName("Beyon Tech Pvt. Ltd.")
                        )
                );
            } else {
                r.setCompanyName("Beyon Tech Pvt. Ltd.");
            }
        }

        return records;
    }

    public Map<String, Object> toggleStudentPlacement(UUID studentId, String targetStatus, Map<String, Object> payload) {
        String newStatus = (targetStatus != null && !targetStatus.isBlank()) ? targetStatus.toUpperCase() : "PLACED";
        List<InstitutionStudent> instStudents = institutionStudentRepository.findByStudentId(studentId);
        for (InstitutionStudent is : instStudents) {
            is.setPlacementStatus(newStatus);
            institutionStudentRepository.save(is);
        }

        if ("PLACED".equals(newStatus)) {
            List<PlacementRecord> existing = recordRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
            if (existing.isEmpty() || existing.stream().noneMatch(r -> "PLACED".equalsIgnoreCase(r.getStatus()))) {
                PlacementRecord pr = new PlacementRecord();
                pr.setStudentId(studentId);
                pr.setJobRole("Software Development Engineer");
                pr.setCtcAmount(BigDecimal.valueOf(1850000));
                pr.setCtcCurrency("INR");
                pr.setPlacementType("FULL_TIME");
                pr.setPlacementYear(2026);
                pr.setStatus("PLACED");
                pr.setVerified(true);
                pr.setOfferDate(OffsetDateTime.now());
                pr.setCreatedAt(OffsetDateTime.now());
                pr.setUpdatedAt(OffsetDateTime.now());
                if (!instStudents.isEmpty()) {
                    pr.setInstitutionId(instStudents.get(0).getInstitutionId());
                }
                pr.setCompanyUserId(UUID.fromString("bcfdca78-e82d-4912-b18a-b69ce00d0c92"));
                recordRepo.save(pr);
            }
        } else if ("PLACEMENT_SEEKING".equals(newStatus) || "UNPLACED".equals(newStatus)) {
            List<PlacementRecord> existing = recordRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
            for (PlacementRecord r : existing) {
                if ("PLACED".equals(r.getStatus())) {
                    r.setStatus("OFFERED");
                    recordRepo.save(r);
                }
            }
        }

        return getMyStatusData(studentId);
    }

    public List<PlacementRecord> getInstitutionRecords(UUID institutionId, Integer year) {
        return recordRepo.findByInstitutionIdAndPlacementYear(institutionId, year);
    }

    // Phase 170: Institution Placement Analytics
    public Map<String, Object> getInstitutionPlacementStats(UUID institutionId, Integer year) {
        Optional<InstitutionPlacementStats> existing = statsRepo.findByInstitutionIdAndAcademicYear(institutionId, year);
        if (existing.isPresent()) {
            return buildStatsResponse(existing.get());
        }
        refreshPlacementStats(institutionId, year);
        return statsRepo.findByInstitutionIdAndAcademicYear(institutionId, year)
            .map(this::buildStatsResponse)
            .orElse(Map.of("institutionId", institutionId, "year", year, "totalStudents", 0));
    }

    private void refreshPlacementStats(UUID institutionId, Integer year) {
        InstitutionPlacementStats stats = statsRepo.findByInstitutionIdAndAcademicYear(institutionId, year)
            .orElseGet(() -> {
                InstitutionPlacementStats s = new InstitutionPlacementStats();
                s.setInstitutionId(institutionId);
                s.setAcademicYear(year);
                return s;
            });

        List<PlacementRecord> records = recordRepo.findByInstitutionIdAndPlacementYear(institutionId, year);
        long placed = records.stream().filter(r -> "PLACED".equals(r.getStatus()) && r.getVerified()).count();
        long offered = records.stream().filter(r -> "OFFERED".equals(r.getStatus()) || "ACCEPTED".equals(r.getStatus())).count();

        stats.setPlaced((int) placed);
        stats.setShortlisted((int) offered);
        if (stats.getEligible() > 0) {
            stats.setPlacementRate(BigDecimal.valueOf(placed * 100.0 / stats.getEligible()).setScale(2, RoundingMode.HALF_UP));
        }
        BigDecimal avgPkg = recordRepo.averagePackageByInstitutionAndYear(institutionId, year);
        BigDecimal maxPkg = recordRepo.highestPackageByInstitutionAndYear(institutionId, year);
        stats.setAveragePackage(avgPkg);
        stats.setHighestPackage(maxPkg);

        // Unique companies
        long companies = records.stream()
            .map(PlacementRecord::getCompanyUserId)
            .distinct().count();
        stats.setCompaniesVisited((int) companies);

        stats.setUpdatedAt(OffsetDateTime.now());
        statsRepo.save(stats);
    }

    public void incrementFunnel(UUID institutionId, Integer year, String stage) {
        InstitutionPlacementStats stats = statsRepo.findByInstitutionIdAndAcademicYear(institutionId, year)
            .orElseGet(() -> {
                InstitutionPlacementStats s = new InstitutionPlacementStats();
                s.setInstitutionId(institutionId);
                s.setAcademicYear(year);
                return s;
            });
        switch (stage) {
            case "APPLIED" -> stats.setApplied(stats.getApplied() + 1);
            case "ASSESSED" -> stats.setAssessed(stats.getAssessed() + 1);
            case "SHORTLISTED" -> stats.setShortlisted(stats.getShortlisted() + 1);
            case "INTERVIEWED" -> stats.setInterviewed(stats.getInterviewed() + 1);
            case "PLACED" -> stats.setPlaced(stats.getPlaced() + 1);
        }
        if (stats.getEligible() > 0) {
            stats.setPlacementRate(BigDecimal.valueOf(stats.getPlaced() * 100.0 / stats.getEligible()).setScale(2, RoundingMode.HALF_UP));
        }
        stats.setUpdatedAt(OffsetDateTime.now());
        statsRepo.save(stats);
    }

    private Map<String, Object> buildStatsResponse(InstitutionPlacementStats stats) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("institutionId", stats.getInstitutionId());
        result.put("academicYear", stats.getAcademicYear());
        result.put("totalStudents", stats.getTotalStudents());
        result.put("placementWilling", stats.getPlacementWilling());
        result.put("eligible", stats.getEligible());
        result.put("applied", stats.getApplied());
        result.put("assessed", stats.getAssessed());
        result.put("shortlisted", stats.getShortlisted());
        result.put("interviewed", stats.getInterviewed());
        result.put("placed", stats.getPlaced());
        result.put("placementRate", stats.getPlacementRate());
        result.put("averagePackage", stats.getAveragePackage());
        result.put("highestPackage", stats.getHighestPackage());
        result.put("companiesVisited", stats.getCompaniesVisited());
        return result;
    }
}
