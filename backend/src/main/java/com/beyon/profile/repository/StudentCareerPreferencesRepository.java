package com.beyon.profile.repository;

import com.beyon.profile.model.StudentCareerPreferences;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StudentCareerPreferencesRepository extends JpaRepository<StudentCareerPreferences, UUID> {
    Optional<StudentCareerPreferences> findByUserId(UUID userId);
}
