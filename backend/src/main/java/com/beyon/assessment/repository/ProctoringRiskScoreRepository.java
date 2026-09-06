package com.beyon.assessment.repository;

import com.beyon.assessment.model.ProctoringRiskScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProctoringRiskScoreRepository extends JpaRepository<ProctoringRiskScore, UUID> {
    List<ProctoringRiskScore> findByProctoringSessionIdOrderByRecordedAtDesc(UUID proctoringSessionId);
    Optional<ProctoringRiskScore> findFirstByProctoringSessionIdOrderByRecordedAtDesc(UUID proctoringSessionId);
}
