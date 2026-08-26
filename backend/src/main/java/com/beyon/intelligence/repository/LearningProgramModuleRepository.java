package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.LearningProgramModule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface LearningProgramModuleRepository extends JpaRepository<LearningProgramModule, UUID> {
    List<LearningProgramModule> findByProgramIdOrderBySortOrder(UUID programId);
}
