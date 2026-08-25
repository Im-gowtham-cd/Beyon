package com.beyon.platform.repository;

import com.beyon.platform.model.UserPrivacySettings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserPrivacySettingsRepository extends JpaRepository<UserPrivacySettings, UUID> {
    Optional<UserPrivacySettings> findByUserId(UUID userId);
}
