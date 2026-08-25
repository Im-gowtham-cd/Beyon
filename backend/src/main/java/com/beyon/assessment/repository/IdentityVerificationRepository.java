package com.beyon.assessment.repository;

import com.beyon.assessment.model.IdentityVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface IdentityVerificationRepository extends JpaRepository<IdentityVerification, UUID> {
    Optional<IdentityVerification> findBySessionId(UUID sessionId);
    Optional<IdentityVerification> findBySessionIdAndStatus(UUID sessionId, String status);
}
