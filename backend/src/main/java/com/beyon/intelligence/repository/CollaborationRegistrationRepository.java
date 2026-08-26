package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.CollaborationRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CollaborationRegistrationRepository extends JpaRepository<CollaborationRegistration, UUID> {
    List<CollaborationRegistration> findByUserIdOrderByRegisteredAtDesc(UUID userId);
    List<CollaborationRegistration> findByProgramId(UUID programId);
    Optional<CollaborationRegistration> findByProgramIdAndUserId(UUID programId, UUID userId);
    long countByProgramId(UUID programId);
}
