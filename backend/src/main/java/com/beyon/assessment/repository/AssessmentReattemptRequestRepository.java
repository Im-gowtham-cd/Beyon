package com.beyon.assessment.repository;

import com.beyon.assessment.model.AssessmentReattemptRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentReattemptRequestRepository extends JpaRepository<AssessmentReattemptRequest, UUID> {

    List<AssessmentReattemptRequest> findByStudentIdOrderByCreatedAtDesc(UUID studentId);

    Optional<AssessmentReattemptRequest> findFirstByStudentIdAndOpportunityIdOrderByCreatedAtDesc(UUID studentId, UUID opportunityId);

    Optional<AssessmentReattemptRequest> findFirstByStudentIdAndOpportunityIdAndStatusOrderByCreatedAtDesc(UUID studentId, UUID opportunityId, String status);

    List<AssessmentReattemptRequest> findByOpportunityIdOrderByCreatedAtDesc(UUID opportunityId);

    List<AssessmentReattemptRequest> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);
}
