package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.PersonalizedChallengeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface PersonalizedChallengeConfigRepository extends JpaRepository<PersonalizedChallengeConfig, UUID> {
    Optional<PersonalizedChallengeConfig> findByStudentId(UUID studentId);
}
