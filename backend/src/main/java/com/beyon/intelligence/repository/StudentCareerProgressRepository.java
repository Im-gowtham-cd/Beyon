package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.StudentCareerProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentCareerProgressRepository extends JpaRepository<StudentCareerProgress, UUID> {
    List<StudentCareerProgress> findByStudentIdOrderByLastUpdatedAtDesc(UUID studentId);
    Optional<StudentCareerProgress> findByStudentIdAndCareerPathId(UUID studentId, UUID careerPathId);
}
