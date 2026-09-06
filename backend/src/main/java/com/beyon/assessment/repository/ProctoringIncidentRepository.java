package com.beyon.assessment.repository;

import com.beyon.assessment.model.ProctoringIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProctoringIncidentRepository extends JpaRepository<ProctoringIncident, UUID> {
    List<ProctoringIncident> findByProctoringSessionIdOrderByStartedAtDesc(UUID proctoringSessionId);
    long countByProctoringSessionIdAndSeverity(UUID proctoringSessionId, String severity);
    long countByProctoringSessionIdAndReviewerActionIsNull(UUID proctoringSessionId);
}