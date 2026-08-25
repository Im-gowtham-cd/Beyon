package com.beyon.community.repository;

import com.beyon.community.model.ProjectVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ProjectVerificationRepository extends JpaRepository<ProjectVerification, UUID> {
    List<ProjectVerification> findByProjectId(UUID projectId);
    List<ProjectVerification> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<ProjectVerification> findByStatus(String status);
}
