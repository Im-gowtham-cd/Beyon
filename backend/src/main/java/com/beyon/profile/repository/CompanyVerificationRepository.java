package com.beyon.profile.repository;

import com.beyon.profile.model.CompanyVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyVerificationRepository extends JpaRepository<CompanyVerification, String> {

    Optional<CompanyVerification> findByUserId(String userId);

    Optional<CompanyVerification> findByCompanyId(String companyId);

    Optional<CompanyVerification> findByCin(String cin);
    Optional<CompanyVerification> findByCinIgnoreCase(String cin);
    boolean existsByCinIgnoreCase(String cin);

    List<CompanyVerification> findByOverallStatusOrderByCreatedAtDesc(String overallStatus);

    List<CompanyVerification> findAllByOrderByCreatedAtDesc();
}
