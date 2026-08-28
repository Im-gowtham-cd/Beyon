package com.beyon.recruitment.service;

import com.beyon.recruitment.model.*;
import com.beyon.recruitment.repository.*;
import com.beyon.notification.service.NotificationService;
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

    public PlacementService(PlacementRegistrationRepository regRepo,
                            PlacementRecordRepository recordRepo,
                            InstitutionPlacementStatsRepository statsRepo) {
        this.regRepo = regRepo;
        this.recordRepo = recordRepo;
        this.statsRepo = statsRepo;
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
        return recordRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
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
