package com.beyon.assessment.repository;

import com.beyon.assessment.model.AssessmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssessmentResultRepository extends JpaRepository<AssessmentResult, UUID> {
    Optional<AssessmentResult> findBySessionId(UUID sessionId);
    List<AssessmentResult> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
}
