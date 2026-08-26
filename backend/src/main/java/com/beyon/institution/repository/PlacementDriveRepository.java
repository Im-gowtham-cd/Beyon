package com.beyon.institution.repository;

import com.beyon.institution.model.PlacementDrive;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, UUID> {
    List<PlacementDrive> findByInstitutionIdOrderByCreatedAtDesc(UUID institutionId);
    List<PlacementDrive> findByCompanyUserIdOrderByCreatedAtDesc(UUID companyUserId);
    List<PlacementDrive> findByInstitutionIdAndStatus(UUID institutionId, String status);
}
