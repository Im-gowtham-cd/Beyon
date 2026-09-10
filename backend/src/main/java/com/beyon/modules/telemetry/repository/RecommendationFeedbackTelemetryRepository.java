package com.beyon.modules.telemetry.repository;

import com.beyon.modules.telemetry.model.RecommendationFeedbackTelemetry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendationFeedbackTelemetryRepository extends MongoRepository<RecommendationFeedbackTelemetry, String> {
    List<RecommendationFeedbackTelemetry> findByStudentIdOrderByTimestampDesc(String studentId);
}
