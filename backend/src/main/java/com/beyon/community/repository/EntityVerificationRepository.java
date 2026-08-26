package com.beyon.community.repository;

import com.beyon.community.model.EntityVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EntityVerificationRepository extends JpaRepository<EntityVerification, UUID> {
    Optional<EntityVerification> findByEntityIdAndEntityTypeAndStatus(UUID entityId, String entityType, String status);
    List<EntityVerification> findByEntityTypeAndStatus(String entityType, String status);
}
