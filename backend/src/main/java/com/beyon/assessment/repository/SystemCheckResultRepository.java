package com.beyon.assessment.repository;

import com.beyon.assessment.model.SystemCheckResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SystemCheckResultRepository extends JpaRepository<SystemCheckResult, UUID> {
    List<SystemCheckResult> findBySessionIdOrderByCheckedAt(UUID sessionId);
    long countBySessionIdAndStatus(UUID sessionId, String status);
}
