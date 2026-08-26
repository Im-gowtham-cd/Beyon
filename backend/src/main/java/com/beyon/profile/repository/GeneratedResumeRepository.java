package com.beyon.profile.repository;

import com.beyon.profile.model.GeneratedResume;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface GeneratedResumeRepository extends JpaRepository<GeneratedResume, UUID> {
    List<GeneratedResume> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
}
