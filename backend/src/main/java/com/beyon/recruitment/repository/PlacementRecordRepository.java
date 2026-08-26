package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.PlacementRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface PlacementRecordRepository extends JpaRepository<PlacementRecord, UUID> {
    List<PlacementRecord> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<PlacementRecord> findByInstitutionIdAndPlacementYear(UUID institutionId, Integer year);
    List<PlacementRecord> findByCompanyUserIdAndPlacementYear(UUID companyUserId, Integer year);
    long countByInstitutionIdAndPlacementYearAndStatus(UUID institutionId, Integer year, String status);
    long countByInstitutionIdAndPlacementYear(UUID institutionId, Integer year);

    @Query("SELECT COALESCE(AVG(p.ctcAmount), 0) FROM PlacementRecord p WHERE p.institutionId = ?1 AND p.placementYear = ?2 AND p.status = 'PLACED' AND p.verified = true")
    BigDecimal averagePackageByInstitutionAndYear(UUID institutionId, Integer year);

    @Query("SELECT COALESCE(MAX(p.ctcAmount), 0) FROM PlacementRecord p WHERE p.institutionId = ?1 AND p.placementYear = ?2 AND p.status = 'PLACED' AND p.verified = true")
    BigDecimal highestPackageByInstitutionAndYear(UUID institutionId, Integer year);
}
