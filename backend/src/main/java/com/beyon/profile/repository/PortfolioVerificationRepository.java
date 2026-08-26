package com.beyon.profile.repository;

import com.beyon.profile.model.PortfolioVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PortfolioVerificationRepository extends JpaRepository<PortfolioVerification, UUID> {
    List<PortfolioVerification> findByProjectId(UUID projectId);
}
