package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.OpportunityMatchDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface OpportunityMatchDetailRepository extends JpaRepository<OpportunityMatchDetail, UUID> {
    Optional<OpportunityMatchDetail> findByStudentIdAndOpportunityId(UUID studentId, UUID opportunityId);
}
