package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.DriveInstitutionTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DriveInstitutionTargetRepository extends JpaRepository<DriveInstitutionTarget, UUID> {
    List<DriveInstitutionTarget> findByDriveId(UUID driveId);
    List<DriveInstitutionTarget> findByInstitutionId(UUID institutionId);
}
