package com.beyon.community.repository;

import com.beyon.community.model.ProjectTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, UUID> {
    List<ProjectTeam> findByProjectIdOrderByCreatedAtDesc(UUID projectId);
    List<ProjectTeam> findByStatusOrderByCreatedAtDesc(String status);
}
