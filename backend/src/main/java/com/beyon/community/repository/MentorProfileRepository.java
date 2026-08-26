package com.beyon.community.repository;

import com.beyon.community.model.MentorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MentorProfileRepository extends JpaRepository<MentorProfile, UUID> {
    Optional<MentorProfile> findByUserId(UUID userId);
    List<MentorProfile> findByAvailability(String availability);
    boolean existsByUserId(UUID userId);
}
