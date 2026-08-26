package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.LearningProgramModuleProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface LearningProgramModuleProgressRepository extends JpaRepository<LearningProgramModuleProgress, UUID> {
    Optional<LearningProgramModuleProgress> findByEnrollmentIdAndModuleId(UUID enrollmentId, UUID moduleId);
    long countByEnrollmentIdAndStatus(UUID enrollmentId, String status);
}
