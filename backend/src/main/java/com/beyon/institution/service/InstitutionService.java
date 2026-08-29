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

    public InstitutionService(InstitutionStudentRepository institutionStudentRepository,
                              InstitutionPlacementRecordRepository placementRecordRepository,
                              InstitutionRatingSnapshotRepository ratingRepository,
                              PlacementDriveRepository placementDriveRepository,
                              UserRepository userRepository,
                              StudentProfileRepository studentProfileRepository) {
        this.institutionStudentRepository = institutionStudentRepository;
        this.placementRecordRepository = placementRecordRepository;
        this.ratingRepository = ratingRepository;
        this.placementDriveRepository = placementDriveRepository;
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
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

    @Transactional
    public InstitutionStudent updatePlacementStatus(UUID institutionId, UUID studentId, String status) {
        InstitutionStudent student = institutionStudentRepository.findByInstitutionIdAndStudentId(institutionId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found in institution"));
        student.setPlacementStatus(status);
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
        return placementDriveRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId);
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
