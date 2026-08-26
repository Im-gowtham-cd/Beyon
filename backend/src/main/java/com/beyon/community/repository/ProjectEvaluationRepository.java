package com.beyon.community.repository;

import com.beyon.community.model.ProjectEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ProjectEvaluationRepository extends JpaRepository<ProjectEvaluation, UUID> {
    List<ProjectEvaluation> findByProjectIdOrderByCreatedAtDesc(UUID projectId);
    List<ProjectEvaluation> findByTeamIdOrderByCreatedAtDesc(UUID teamId);
}
