package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.RecruitmentPipeline;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RecruitmentPipelineRepository extends JpaRepository<RecruitmentPipeline, UUID> {
    List<RecruitmentPipeline> findByOpportunityIdOrderByCreatedAtDesc(UUID opportunityId);
    List<RecruitmentPipeline> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);
    List<RecruitmentPipeline> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<RecruitmentPipeline> findByCurrentStage(String stage);
    long countByOpportunityIdAndCurrentStage(UUID opportunityId, String stage);
}
