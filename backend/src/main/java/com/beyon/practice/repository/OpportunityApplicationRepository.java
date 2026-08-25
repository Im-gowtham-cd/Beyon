package com.beyon.practice.repository;

import com.beyon.practice.model.OpportunityApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OpportunityApplicationRepository extends JpaRepository<OpportunityApplication, UUID> {
    List<OpportunityApplication> findByStudentIdOrderByUpdatedAtDesc(UUID studentId);
    List<OpportunityApplication> findByOpportunityId(UUID opportunityId);
    Optional<OpportunityApplication> findByOpportunityIdAndStudentId(UUID opportunityId, UUID studentId);
    boolean existsByOpportunityIdAndStudentId(UUID opportunityId, UUID studentId);
}
