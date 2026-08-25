package com.beyon.profile.repository;

import com.beyon.profile.model.InstitutionProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface InstitutionProfileRepository extends JpaRepository<InstitutionProfile, UUID> {
    Optional<InstitutionProfile> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);
}
