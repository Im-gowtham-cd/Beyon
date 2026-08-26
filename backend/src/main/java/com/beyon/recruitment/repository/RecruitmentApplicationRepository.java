package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.RecruitmentApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecruitmentApplicationRepository extends JpaRepository<RecruitmentApplication, UUID> {
    List<RecruitmentApplication> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<RecruitmentApplication> findByOpportunityId(UUID opportunityId);
    List<RecruitmentApplication> findByDriveId(UUID driveId);
    Optional<RecruitmentApplication> findByOpportunityIdAndStudentId(UUID opportunityId, UUID studentId);
    boolean existsByOpportunityIdAndStudentId(UUID opportunityId, UUID studentId);
    long countByOpportunityIdAndStatus(UUID opportunityId, String status);
    long countByDriveIdAndStatus(UUID driveId, String status);
}
