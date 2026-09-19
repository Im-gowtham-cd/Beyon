package com.beyon.institution.repository;

import com.beyon.institution.model.InstitutionOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InstitutionOtpRepository extends JpaRepository<InstitutionOtp, UUID> {
    Optional<InstitutionOtp> findTopByAicteIdAndPrincipalEmailIgnoreCaseAndConsumedFalseOrderByCreatedAtDesc(String aicteId, String principalEmail);
    List<InstitutionOtp> findByAicteIdOrderByCreatedAtDesc(String aicteId);
}
