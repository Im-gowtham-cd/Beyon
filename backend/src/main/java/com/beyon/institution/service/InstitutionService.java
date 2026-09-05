package com.beyon.institution.service;

import com.beyon.common.exception.ConflictException;
import com.beyon.common.exception.ForbiddenException;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.institution.model.*;
import com.beyon.institution.repository.*;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.profile.model.StudentProfile;
import com.beyon.profile.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InstitutionService {

    private final InstitutionStudentRepository institutionStudentRepository;
    private final InstitutionPlacementRecordRepository placementRecordRepository;
    private final InstitutionRatingSnapshotRepository ratingRepository;
    private final PlacementDriveRepository placementDriveRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final com.beyon.practice.repository.CompanyOpportunityRepository opportunityRepository;
    private final com.beyon.profile.repository.CompanyProfileRepository companyProfileRepository;
    private final com.beyon.recruitment.repository.RecruitmentApplicationRepository recruitmentApplicationRepository;

    public InstitutionService(InstitutionStudentRepository institutionStudentRepository,
                              InstitutionPlacementRecordRepository placementRecordRepository,
                              InstitutionRatingSnapshotRepository ratingRepository,
                              PlacementDriveRepository placementDriveRepository,
                              UserRepository userRepository,
                              StudentProfileRepository studentProfileRepository,
                              com.beyon.practice.repository.CompanyOpportunityRepository opportunityRepository,
                              com.beyon.profile.repository.CompanyProfileRepository companyProfileRepository,
                              com.beyon.recruitment.repository.RecruitmentApplicationRepository recruitmentApplicationRepository) {
        this.institutionStudentRepository = institutionStudentRepository;
        this.placementRecordRepository = placementRecordRepository;
        this.ratingRepository = ratingRepository;
        this.placementDriveRepository = placementDriveRepository;
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.opportunityRepository = opportunityRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.recruitmentApplicationRepository = recruitmentApplicationRepository;
    }

    public List<InstitutionStudent> getStudents(UUID institutionId) {
        return institutionStudentRepository.findByInstitutionId(institutionId);
    }

    public List<InstitutionStudent> getStudentsByStatus(UUID institutionId, String status) {
        return institutionStudentRepository.findByInstitutionIdAndPlacementStatus(institutionId, status);
    }

    @Transactional
    public InstitutionStudent addStudent(UUID institutionId, UUID studentId, String department, String batch) {
        if (institutionStudentRepository.findByInstitutionIdAndStudentId(institutionId, studentId).isPresent()) {
            throw new ConflictException("Student already linked to this institution");
        }
        InstitutionStudent student = new InstitutionStudent();
        student.setInstitutionId(institutionId);
        student.setStudentId(studentId);
        student.setDepartment(department);
        student.setBatch(batch);
        return institutionStudentRepository.save(student);
    }

    public List<Map<String, Object>> getPendingStudentsWithDetails(UUID institutionId) {
        List<InstitutionStudent> pending = institutionStudentRepository.findByInstitutionIdAndPlacementStatus(institutionId, "PENDING_VERIFICATION");
        if (pending.isEmpty()) {
            pending = institutionStudentRepository.findByInstitutionId(institutionId).stream()
                    .filter(s -> !s.isVerified())
                    .collect(Collectors.toList());
        }
        List<Map<String, Object>> results = new ArrayList<>();
        for (InstitutionStudent is : pending) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", is.getId());
            map.put("studentId", is.getStudentId());
            map.put("department", is.getDepartment());
            map.put("batch", is.getBatch());
            map.put("placementStatus", is.getPlacementStatus());
            map.put("verified", is.isVerified());
            map.put("createdAt", is.getCreatedAt());

            userRepository.findById(is.getStudentId()).ifPresent(u -> {
                map.put("email", u.getEmail());
                map.put("displayName", u.getDisplayName());
                map.put("profileStatus", u.getProfileStatus() != null ? u.getProfileStatus().name() : "INCOMPLETE");
            });

            studentProfileRepository.findByUserId(is.getStudentId()).ifPresent(sp -> {
                map.put("registrationNumber", sp.getRegistrationNumber());
                map.put("cgpa", sp.getCgpa());
                map.put("degree", sp.getDegree());
                map.put("phone", sp.getPhone());
                map.put("completionPct", sp.getCompletionPct());
            });

            results.add(map);
        }
        return results;
    }

    @Transactional
    public InstitutionStudent updatePlacementStatus(UUID institutionId, UUID studentId, String status) {
        InstitutionStudent student = institutionStudentRepository.findByInstitutionIdAndStudentId(institutionId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found in institution"));
        student.setPlacementStatus(status);
        return institutionStudentRepository.save(student);
    }

    @Transactional
    public InstitutionStudent verifyStudent(UUID institutionId, UUID studentId, boolean approved, String notes) {
        InstitutionStudent student = institutionStudentRepository.findByInstitutionIdAndStudentId(institutionId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found in institution"));

        if (approved) {
            student.setVerified(true);
            student.setPlacementStatus("PLACEMENT_SEEKING");
            userRepository.findById(studentId).ifPresent(u -> {
                u.setProfileStatus(com.beyon.identity.enums.AccountStatus.COMPLETED);
                userRepository.save(u);
            });
        } else {
            student.setVerified(false);
            student.setPlacementStatus("REJECTED");
            userRepository.findById(studentId).ifPresent(u -> {
                u.setProfileStatus(com.beyon.identity.enums.AccountStatus.REJECTED);
                userRepository.save(u);
            });
        }
        return institutionStudentRepository.save(student);
    }

    public Map<String, Object> getInstitutionMetrics(UUID institutionId) {
        Map<String, Object> metrics = new HashMap<>();
        long totalStudents = institutionStudentRepository.countByInstitutionId(institutionId);
        long placed = institutionStudentRepository.countByInstitutionIdAndPlacementStatus(institutionId, "PLACED");
        long seeking = institutionStudentRepository.countByInstitutionIdAndPlacementStatus(institutionId, "PLACEMENT_SEEKING");

        metrics.put("totalStudents", totalStudents);
        metrics.put("studentsPlaced", placed);
        metrics.put("placementSeeking", seeking);
        metrics.put("placementPercentage", totalStudents > 0 ? (placed * 100.0 / totalStudents) : 0);

        List<PlacementRecord> records = placementRecordRepository.findByInstitutionId(institutionId);
        if (!records.isEmpty()) {
            double avgPackage = records.stream()
                    .filter(r -> r.getPackageLpa() != null)
                    .mapToDouble(r -> r.getPackageLpa().doubleValue())
                    .average().orElse(0);
            double maxPackage = records.stream()
                    .filter(r -> r.getPackageLpa() != null)
                    .mapToDouble(r -> r.getPackageLpa().doubleValue())
                    .max().orElse(0);
            long tier1 = records.stream().filter(r -> "TIER_1".equals(r.getCompanyTier())).count();
            long tier2 = records.stream().filter(r -> "TIER_2".equals(r.getCompanyTier())).count();

            metrics.put("averagePackage", avgPackage);
            metrics.put("highestPackage", maxPackage);
            metrics.put("tier1Placements", tier1);
            metrics.put("tier2Placements", tier2);
        }

        Set<String> companies = records.stream().map(PlacementRecord::getCompanyName).collect(Collectors.toSet());
        metrics.put("companiesVisited", companies.size());

        return metrics;
    }

    @Transactional
    public InstitutionRatingSnapshot calculateAndSaveRating(UUID institutionId) {
        Map<String, Object> metrics = getInstitutionMetrics(institutionId);
        InstitutionRatingSnapshot snapshot = new InstitutionRatingSnapshot();
        snapshot.setInstitutionId(institutionId);
        snapshot.setTotalStudents(((Number) metrics.get("totalStudents")).intValue());
        snapshot.setStudentsPlaced(((Number) metrics.get("studentsPlaced")).intValue());

        double placementPct = (double) metrics.get("placementPercentage");
        snapshot.setPlacementPercentage(BigDecimal.valueOf(placementPct).setScale(2, RoundingMode.HALF_UP));

        double avgPkg = metrics.containsKey("averagePackage") ? (double) metrics.get("averagePackage") : 0;
        double maxPkg = metrics.containsKey("highestPackage") ? (double) metrics.get("highestPackage") : 0;
        snapshot.setAveragePackage(BigDecimal.valueOf(avgPkg).setScale(2, RoundingMode.HALF_UP));
        snapshot.setHighestPackage(BigDecimal.valueOf(maxPkg).setScale(2, RoundingMode.HALF_UP));
        snapshot.setCompaniesVisited(((Number) metrics.get("companiesVisited")).intValue());
        snapshot.setTier1Count(metrics.containsKey("tier1Placements") ? ((Number) metrics.get("tier1Placements")).intValue() : 0);
        snapshot.setTier2Count(metrics.containsKey("tier2Placements") ? ((Number) metrics.get("tier2Placements")).intValue() : 0);

        BigDecimal placementScore = BigDecimal.valueOf(Math.min(placementPct / 80 * 5, 5)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal salaryScore = BigDecimal.valueOf(Math.min(avgPkg / 10 * 5, 5)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal industryScore = BigDecimal.valueOf(Math.min(snapshot.getCompaniesVisited() / 20.0 * 5, 5)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal academicScore = BigDecimal.valueOf(3.5);
        BigDecimal skillScore = BigDecimal.valueOf(3.0);

        snapshot.setPlacementScore(placementScore);
        snapshot.setSalaryScore(salaryScore);
        snapshot.setIndustryScore(industryScore);
        snapshot.setAcademicScore(academicScore);
        snapshot.setSkillScore(skillScore);

        BigDecimal overall = placementScore.multiply(BigDecimal.valueOf(0.3))
                .add(salaryScore.multiply(BigDecimal.valueOf(0.25)))
                .add(industryScore.multiply(BigDecimal.valueOf(0.2)))
                .add(academicScore.multiply(BigDecimal.valueOf(0.15)))
                .add(skillScore.multiply(BigDecimal.valueOf(0.1)))
                .setScale(2, RoundingMode.HALF_UP);
        snapshot.setOverallRating(overall);

        return ratingRepository.save(snapshot);
    }

    public InstitutionRatingSnapshot getLatestRating(UUID institutionId) {
        return ratingRepository.findTopByInstitutionIdOrderBySnapshotDateDesc(institutionId);
    }

    public List<PlacementDrive> getDrives(UUID institutionId) {
        // Sync any published campus drives targeted at this institution
        try {
            var campusOpps = opportunityRepository.findAll();
            for (var opp : campusOpps) {
                if ("CAMPUS_DRIVE".equalsIgnoreCase(opp.getOpportunityType()) &&
                    opp.getTargetInstitutionIds() != null &&
                    opp.getTargetInstitutionIds().contains(institutionId.toString())) {

                    boolean exists = placementDriveRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId).stream()
                            .anyMatch(pd -> opp.getId().equals(pd.getOpportunityId()));
                    if (!exists) {
                        PlacementDrive pd = new PlacementDrive();
                        pd.setOpportunityId(opp.getId());
                        pd.setInstitutionId(institutionId);
                        pd.setCompanyUserId(opp.getCompanyUserId());
                        pd.setTitle(opp.getTitle());
                        pd.setDescription(opp.getDescription());
                        pd.setStatus("PENDING_APPROVAL");
                        placementDriveRepository.save(pd);
                    }
                }
            }
        } catch (Exception ignored) {}

        List<PlacementDrive> drives = placementDriveRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId);
        String instName = userRepository.findById(institutionId).map(User::getDisplayName).orElse("");

        for (PlacementDrive d : drives) {
            if (d.getOpportunityId() != null) {
                opportunityRepository.findById(d.getOpportunityId()).ifPresent(opp -> {
                    d.setRole(opp.getTitle());
                    d.setMinCgpa(opp.getMinCgpa() != null ? opp.getMinCgpa() : BigDecimal.valueOf(7.0));
                    d.setEligibleDepts(opp.getEligibleDepartments() != null ? opp.getEligibleDepartments() : "All Engineering Streams");
                    d.setEligibleBatch(opp.getEligibleGraduationYears() != null ? opp.getEligibleGraduationYears() : "2026 Batch");
                    d.setLocation(opp.getLocation() != null ? opp.getLocation() : "Campus / Hybrid");
                    d.setPackageLpa(opp.getPackageLpa() != null ? opp.getPackageLpa() : (d.getPackageLpa() != null ? d.getPackageLpa() : BigDecimal.valueOf(12.0)));
                });
            }
            if (d.getCompanyUserId() != null) {
                companyProfileRepository.findByUserId(d.getCompanyUserId()).ifPresent(cp -> {
                    if (cp.getCompanyName() != null && !cp.getCompanyName().isBlank()) {
                        d.setCompanyName(cp.getCompanyName());
                    }
                });
                if (d.getCompanyName() == null) {
                    userRepository.findById(d.getCompanyUserId()).ifPresent(u -> d.setCompanyName(u.getDisplayName()));
                }
            }
            if (d.getCompanyName() == null) {
                d.setCompanyName("Corporate Partner");
            }
            d.setDriveType("ON_CAMPUS");
            d.setInterviewDate(d.getDriveDate() != null ? d.getDriveDate().toString() : "Scheduled on Confirmation");

            // Calculate actual applied candidates count dynamically
            List<com.beyon.recruitment.model.RecruitmentApplication> apps = new ArrayList<>();
            if (d.getOpportunityId() != null) {
                apps.addAll(recruitmentApplicationRepository.findByOpportunityId(d.getOpportunityId()));
            }
            apps.addAll(recruitmentApplicationRepository.findByDriveId(d.getId()));

            Set<UUID> registeredStudents = new HashSet<>();
            for (com.beyon.recruitment.model.RecruitmentApplication app : apps) {
                UUID studentId = app.getStudentId();
                if (studentId == null || registeredStudents.contains(studentId)) continue;

                boolean belongs = false;
                if (institutionId.equals(app.getInstitutionId())) {
                    belongs = true;
                } else {
                    var prof = studentProfileRepository.findByUserId(studentId);
                    if (prof.isPresent()) {
                        String sInst = prof.get().getInstitution();
                        if (sInst != null && !sInst.isBlank() && !instName.isBlank() && sInst.trim().equalsIgnoreCase(instName.trim())) {
                            belongs = true;
                        }
                    }
                    if (!belongs && institutionStudentRepository.existsByInstitutionIdAndStudentId(institutionId, studentId)) {
                        belongs = true;
                    }
                }
                if (belongs) {
                    registeredStudents.add(studentId);
                }
            }
            int actualCount = registeredStudents.size();
            d.setAppliedCount(actualCount);
            d.setApplicantCount(actualCount);
            placementDriveRepository.save(d);
        }
        return drives;
    }

    public List<Map<String, Object>> getDriveApplications(UUID driveId, UUID institutionId) {
        PlacementDrive drive = placementDriveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Drive slot not found"));
        if (!drive.getInstitutionId().equals(institutionId)) {
            throw new ForbiddenException("Not authorized for this institution drive");
        }

        String instName = userRepository.findById(institutionId).map(User::getDisplayName).orElse("");

        List<com.beyon.recruitment.model.RecruitmentApplication> apps = new ArrayList<>();
        if (drive.getOpportunityId() != null) {
            apps.addAll(recruitmentApplicationRepository.findByOpportunityId(drive.getOpportunityId()));
        }
        apps.addAll(recruitmentApplicationRepository.findByDriveId(driveId));

        Map<UUID, com.beyon.recruitment.model.RecruitmentApplication> uniqueApps = new LinkedHashMap<>();
        for (var app : apps) {
            if (app.getStudentId() != null) {
                uniqueApps.putIfAbsent(app.getStudentId(), app);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (var app : uniqueApps.values()) {
            UUID studentId = app.getStudentId();
            boolean belongs = false;
            if (institutionId.equals(app.getInstitutionId())) {
                belongs = true;
            } else {
                var prof = studentProfileRepository.findByUserId(studentId);
                if (prof.isPresent()) {
                    String sInst = prof.get().getInstitution();
                    if (sInst != null && !sInst.isBlank() && !instName.isBlank() && sInst.trim().equalsIgnoreCase(instName.trim())) {
                        belongs = true;
                    }
                }
                if (!belongs && institutionStudentRepository.existsByInstitutionIdAndStudentId(institutionId, studentId)) {
                    belongs = true;
                }
            }
            if (!belongs) continue;

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", app.getId());
            map.put("studentId", studentId);
            map.put("opportunityId", app.getOpportunityId());
            map.put("driveId", driveId);
            map.put("status", app.getStatus() != null ? app.getStatus() : "APPLIED");
            map.put("coinsSpent", app.getCoinsSpent());
            map.put("appliedAt", app.getCreatedAt() != null ? app.getCreatedAt().toString() : java.time.Instant.now().toString());

            userRepository.findById(studentId).ifPresent(u -> {
                map.put("studentName", u.getDisplayName());
                map.put("name", u.getDisplayName());
                map.put("studentEmail", u.getEmail());
                map.put("email", u.getEmail());
            });

            studentProfileRepository.findByUserId(studentId).ifPresent(prof -> {
                map.put("department", prof.getDepartment());
                map.put("degree", prof.getDegree());
                map.put("registrationNumber", prof.getRegistrationNumber());
                map.put("cgpa", prof.getCgpa());
                map.put("academicYear", prof.getAcademicYear());
                map.put("phone", prof.getPhone());
            });

            result.add(map);
        }
        return result;
    }

    @Transactional
    public PlacementDrive createDrive(PlacementDrive drive, UUID institutionId) {
        drive.setInstitutionId(institutionId);
        if (drive.getStatus() == null || drive.getStatus().isBlank()) {
            drive.setStatus("ACTIVE");
        }
        return placementDriveRepository.save(drive);
    }

    @Transactional
    public PlacementDrive approveDrive(UUID driveId, UUID institutionId) {
        PlacementDrive drive = placementDriveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Drive not found"));
        if (!drive.getInstitutionId().equals(institutionId)) {
            throw new ForbiddenException("Not your institution's drive");
        }
        drive.setStatus("APPROVED");
        return placementDriveRepository.save(drive);
    }
}
