package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.MatchingScore;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MatchingScoreRepository extends JpaRepository<MatchingScore, UUID> {
    Optional<MatchingScore> findByStudentIdAndOpportunityId(UUID studentId, UUID opportunityId);
    List<MatchingScore> findByOpportunityIdOrderByTotalScoreDesc(UUID opportunityId);
    List<MatchingScore> findByStudentIdOrderByTotalScoreDesc(UUID studentId);
}
