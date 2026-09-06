package com.beyon.assessment.repository;

import com.beyon.assessment.model.DualViewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DualViewSessionRepository extends JpaRepository<DualViewSession, UUID> {
    List<DualViewSession> findByAssessmentSessionId(UUID assessmentSessionId);
}
