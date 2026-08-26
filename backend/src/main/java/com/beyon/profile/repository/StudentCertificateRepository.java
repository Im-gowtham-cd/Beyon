package com.beyon.profile.repository;

import com.beyon.profile.model.StudentCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentCertificateRepository extends JpaRepository<StudentCertificate, UUID> {
    List<StudentCertificate> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    Optional<StudentCertificate> findByCertificateId(String certificateId);
    Optional<StudentCertificate> findByStudentIdAndProgramId(UUID studentId, UUID programId);
}
