package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.AdaptiveLearningPath;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AdaptiveLearningPathRepository extends JpaRepository<AdaptiveLearningPath, UUID> {
    List<AdaptiveLearningPath> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    Optional<AdaptiveLearningPath> findByStudentIdAndCareerPathIdAndStatus(UUID studentId, UUID careerPathId, String status);
}
