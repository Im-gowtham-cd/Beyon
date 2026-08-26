package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.LearningProgramEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LearningProgramEnrollmentRepository extends JpaRepository<LearningProgramEnrollment, UUID> {
    List<LearningProgramEnrollment> findByStudentIdOrderByEnrolledAtDesc(UUID studentId);
    Optional<LearningProgramEnrollment> findByStudentIdAndProgramId(UUID studentId, UUID programId);
}
