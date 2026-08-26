package com.beyon.profile.repository;

import com.beyon.profile.model.PortfolioProject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PortfolioProjectRepository extends JpaRepository<PortfolioProject, UUID> {
    List<PortfolioProject> findByStudentIdOrderBySortOrder(UUID studentId);
    List<PortfolioProject> findByStudentIdAndIsFeaturedTrueOrderBySortOrder(UUID studentId);
}
