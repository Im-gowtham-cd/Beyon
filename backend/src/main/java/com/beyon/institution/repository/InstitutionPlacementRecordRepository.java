package com.beyon.institution.repository;

import com.beyon.institution.model.PlacementRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InstitutionPlacementRecordRepository extends JpaRepository<PlacementRecord, UUID> {
    List<PlacementRecord> findByInstitutionId(UUID institutionId);
    List<PlacementRecord> findByStudentId(UUID studentId);
    long countByInstitutionId(UUID institutionId);
    long countByInstitutionIdAndCompanyTier(UUID institutionId, String tier);
}
