package com.beyon.community.repository;

import com.beyon.community.model.UserReputation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserReputationRepository extends JpaRepository<UserReputation, UUID> {
    Optional<UserReputation> findByUserId(UUID userId);
}
