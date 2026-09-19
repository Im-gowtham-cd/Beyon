package com.beyon.modules.telemetry.repository;

import com.beyon.modules.telemetry.model.AssessmentAttemptTelemetry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentAttemptTelemetryRepository extends MongoRepository<AssessmentAttemptTelemetry, String> {
    List<AssessmentAttemptTelemetry> findByStudentIdOrderByTimestampDesc(String studentId);
    List<AssessmentAttemptTelemetry> findBySessionId(String sessionId);
}
