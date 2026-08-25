package com.beyon.profile.repository;

import com.beyon.profile.model.StudentCertification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StudentCertificationRepository extends JpaRepository<StudentCertification, UUID> {
    List<StudentCertification> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
