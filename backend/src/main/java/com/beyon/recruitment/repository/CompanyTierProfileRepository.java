package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.CompanyTierProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface CompanyTierProfileRepository extends JpaRepository<CompanyTierProfile, UUID> {
    Optional<CompanyTierProfile> findByCompanyUserId(UUID companyUserId);
}
