package com.beyon.profile.repository;

import com.beyon.profile.model.CompanyHiringPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface CompanyHiringPreferenceRepository extends JpaRepository<CompanyHiringPreference, UUID> {
    Optional<CompanyHiringPreference> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
