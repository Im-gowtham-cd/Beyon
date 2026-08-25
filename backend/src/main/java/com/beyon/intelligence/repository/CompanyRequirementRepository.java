package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.CompanyRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CompanyRequirementRepository extends JpaRepository<CompanyRequirement, UUID> {
    List<CompanyRequirement> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);
    List<CompanyRequirement> findByOpportunityId(UUID opportunityId);
    List<CompanyRequirement> findByStatus(String status);
}
