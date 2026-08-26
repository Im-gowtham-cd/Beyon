package com.beyon.assessment.repository;

import com.beyon.assessment.model.AssessmentSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssessmentSessionRepository extends JpaRepository<AssessmentSession, UUID> {
    Optional<AssessmentSession> findBySessionToken(String sessionToken);
    Optional<AssessmentSession> findByLaunchToken(String launchToken);
    Optional<AssessmentSession> findByApplicationId(UUID applicationId);
    List<AssessmentSession> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<AssessmentSession> findByOpportunityIdAndStatusIn(UUID opportunityId, List<String> statuses);

    @Query("SELECT s FROM AssessmentSession s WHERE s.status IN ('CREATED','LAUNCHED','VERIFYING','SYSTEM_CHECK','IN_PROGRESS') AND s.expiresAt < CURRENT_TIMESTAMP")
    List<AssessmentSession> findExpiredActiveSessions();

    @Query("SELECT s FROM AssessmentSession s WHERE s.lastHeartbeatAt < :threshold AND s.status = 'IN_PROGRESS'")
    List<AssessmentSession> findStaleSessions(java.time.OffsetDateTime threshold);

    long countByOpportunityIdAndIntegrityStatusIn(UUID opportunityId, List<String> statuses);
}
