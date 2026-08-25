package com.beyon.assessment.repository;

import com.beyon.assessment.model.AssessmentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssessmentAnswerRepository extends JpaRepository<AssessmentAnswer, UUID> {
    List<AssessmentAnswer> findBySessionIdOrderByCreatedAt(UUID sessionId);
    Optional<AssessmentAnswer> findBySessionIdAndQuestionId(UUID sessionId, UUID questionId);
    long countBySessionId(UUID sessionId);
    long countBySessionIdAndIsCorrectTrue(UUID sessionId);
    long countBySessionIdAndAnsweredAtIsNotNull(UUID sessionId);
}
