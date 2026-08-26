package com.beyon.assessment.repository;

import com.beyon.assessment.model.ProctoringEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface ProctoringEventRepository extends JpaRepository<ProctoringEvent, UUID> {
    List<ProctoringEvent> findBySessionIdOrderByTimestampDesc(UUID sessionId);
    List<ProctoringEvent> findBySessionIdAndSeverity(UUID sessionId, String severity);
    long countBySessionId(UUID sessionId);
    long countBySessionIdAndSeverity(UUID sessionId, String severity);

    @Query("SELECT p.eventType, COUNT(p) FROM ProctoringEvent p WHERE p.sessionId = :sessionId GROUP BY p.eventType ORDER BY COUNT(p) DESC")
    List<Object[]> countByEventTypeForSession(UUID sessionId);
}
