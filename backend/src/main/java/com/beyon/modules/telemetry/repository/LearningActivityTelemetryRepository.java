package com.beyon.modules.telemetry.repository;

import com.beyon.modules.telemetry.model.LearningActivityTelemetry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningActivityTelemetryRepository extends MongoRepository<LearningActivityTelemetry, String> {
    List<LearningActivityTelemetry> findByStudentIdOrderByTimestampDesc(String studentId);
}
