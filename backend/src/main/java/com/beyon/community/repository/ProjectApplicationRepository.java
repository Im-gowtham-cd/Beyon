package com.beyon.community.repository;

import com.beyon.community.model.ProjectApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectApplicationRepository extends JpaRepository<ProjectApplication, UUID> {
    List<ProjectApplication> findByStudentId(UUID studentId);
    List<ProjectApplication> findByProjectId(UUID projectId);
    Optional<ProjectApplication> findByProjectIdAndStudentId(UUID projectId, UUID studentId);
}
