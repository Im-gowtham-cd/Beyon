package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.PortfolioAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface PortfolioAnalysisRepository extends JpaRepository<PortfolioAnalysis, UUID> {
    Optional<PortfolioAnalysis> findTopByStudentIdOrderByAnalyzedAtDesc(UUID studentId);
}
