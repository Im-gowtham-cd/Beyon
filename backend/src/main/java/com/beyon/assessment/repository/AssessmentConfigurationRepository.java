package com.beyon.assessment.repository;

import com.beyon.assessment.model.AssessmentConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AssessmentConfigurationRepository extends JpaRepository<AssessmentConfiguration, UUID> {
    List<AssessmentConfiguration> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);
    List<AssessmentConfiguration> findByStatus(String status);
}
