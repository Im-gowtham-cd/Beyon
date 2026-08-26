package com.beyon.community.repository;

import com.beyon.community.model.IndustryProject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface IndustryProjectRepository extends JpaRepository<IndustryProject, UUID> {
    List<IndustryProject> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);
    List<IndustryProject> findByStatus(String status);
}
