package com.beyon.institution.repository;

import com.beyon.institution.model.PlacementRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface PlacementRecordRepository extends JpaRepository<PlacementRecord, UUID> {
    List<PlacementRecord> findByInstitutionId(UUID institutionId);
    List<PlacementRecord> findByStudentId(UUID studentId);
    long countByInstitutionId(UUID institutionId);
    long countByInstitutionIdAndCompanyTier(UUID institutionId, String tier);
}
