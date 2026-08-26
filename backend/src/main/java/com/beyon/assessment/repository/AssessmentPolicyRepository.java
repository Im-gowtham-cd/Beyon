package com.beyon.assessment.repository;

import com.beyon.assessment.model.AssessmentPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssessmentPolicyRepository extends JpaRepository<AssessmentPolicy, UUID> {
    List<AssessmentPolicy> findByCompanyUserId(UUID companyUserId);
    Optional<AssessmentPolicy> findByOpportunityId(UUID opportunityId);
}
