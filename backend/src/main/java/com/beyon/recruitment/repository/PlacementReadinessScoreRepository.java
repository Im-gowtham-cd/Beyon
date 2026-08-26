package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.PlacementReadinessScore;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface PlacementReadinessScoreRepository extends JpaRepository<PlacementReadinessScore, UUID> {
    Optional<PlacementReadinessScore> findByStudentId(UUID studentId);
}
