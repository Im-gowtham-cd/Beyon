package com.beyon.platform.repository;

import com.beyon.platform.model.RecommendationSignal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RecommendationSignalRepository extends JpaRepository<RecommendationSignal, UUID> {
    List<RecommendationSignal> findByUserIdAndRecommendationType(UUID userId, String recType);
}
