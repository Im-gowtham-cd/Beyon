package com.beyon.platform.repository;

import com.beyon.platform.model.SecurityAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SecurityAuditLogRepository extends JpaRepository<SecurityAuditLog, UUID> {
    List<SecurityAuditLog> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<SecurityAuditLog> findByActionOrderByCreatedAtDesc(String action);
    long countByUserIdAndActionAndCreatedAtAfter(UUID userId, String action, java.time.OffsetDateTime since);
}
