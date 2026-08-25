package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.InterviewRound;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface InterviewRoundRepository extends JpaRepository<InterviewRound, UUID> {
    List<InterviewRound> findByOpportunityIdOrderBySortOrder(UUID opportunityId);
}
