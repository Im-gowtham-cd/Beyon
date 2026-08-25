package com.beyon.assessment.repository;

import com.beyon.assessment.model.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AuditEventRepository extends JpaRepository<AuditEvent, UUID> {
    List<AuditEvent> findBySessionIdOrderByCreatedAtDesc(UUID sessionId);
    List<AuditEvent> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<AuditEvent> findByEventTypeOrderByCreatedAtDesc(String eventType);
}
