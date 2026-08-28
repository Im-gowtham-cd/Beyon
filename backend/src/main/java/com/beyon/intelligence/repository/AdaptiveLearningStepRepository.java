package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.AdaptiveLearningStep;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AdaptiveLearningStepRepository extends JpaRepository<AdaptiveLearningStep, UUID> {
    List<AdaptiveLearningStep> findByPathIdOrderByStepOrder(UUID pathId);
}
