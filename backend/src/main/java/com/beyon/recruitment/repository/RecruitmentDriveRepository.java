package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.RecruitmentDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RecruitmentDriveRepository extends JpaRepository<RecruitmentDrive, UUID> {
    List<RecruitmentDrive> findByCompanyUserIdOrderByCreatedAtDesc(UUID companyUserId);
    List<RecruitmentDrive> findByStatusOrderByCreatedAtDesc(String status);
    List<RecruitmentDrive> findByTargetingModeAndStatusOrderByCreatedAtDesc(String targetingMode, String status);
}
