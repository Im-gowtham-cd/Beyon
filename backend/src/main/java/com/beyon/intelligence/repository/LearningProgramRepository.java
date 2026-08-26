package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.LearningProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface LearningProgramRepository extends JpaRepository<LearningProgram, UUID> {
    List<LearningProgram> findByIsActiveTrueOrderByCreatedAtDesc();
}
