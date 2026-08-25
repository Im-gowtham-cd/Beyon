package com.beyon.profile.repository;

import com.beyon.profile.model.StudentProject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StudentProjectRepository extends JpaRepository<StudentProject, UUID> {
    List<StudentProject> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
