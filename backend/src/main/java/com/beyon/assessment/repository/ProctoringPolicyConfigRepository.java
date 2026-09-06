package com.beyon.assessment.repository;

import com.beyon.assessment.model.ProctoringPolicyConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProctoringPolicyConfigRepository extends JpaRepository<ProctoringPolicyConfig, UUID> {
    Optional<ProctoringPolicyConfig> findByOpportunityId(UUID opportunityId);
    Optional<ProctoringPolicyConfig> findByCompanyUserId(UUID companyUserId);
}