package com.beyon.platform.repository;

import com.beyon.platform.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {
    List<UserSession> findByUserIdAndIsActiveTrue(UUID userId);
    Optional<UserSession> findByTokenHashAndIsActiveTrue(String tokenHash);
    long countByUserIdAndIsActiveTrue(UUID userId);
}
