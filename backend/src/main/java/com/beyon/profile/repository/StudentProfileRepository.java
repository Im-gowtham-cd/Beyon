package com.beyon.profile.repository;

import com.beyon.profile.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, UUID> {
    Optional<StudentProfile> findByUserId(UUID userId);
    Optional<StudentProfile> findByUsername(String username);
    boolean existsByUserId(UUID userId);
    boolean existsByUsername(String username);
}
