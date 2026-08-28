package com.beyon.profile.repository;

import com.beyon.profile.model.BeyonCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BeyonCertificateRepository extends JpaRepository<BeyonCertificate, UUID> {
    List<BeyonCertificate> findByStudentIdOrderByIssuedAtDesc(UUID studentId);
    Optional<BeyonCertificate> findByCertificateNumber(String certificateNumber);
    long countByStudentId(UUID studentId);
}
