package com.beyon.platform.repository;

import com.beyon.platform.model.PlatformReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PlatformReportRepository extends JpaRepository<PlatformReport, UUID> {
    List<PlatformReport> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<PlatformReport> findByGenerationStatusOrderByCreatedAtDesc(String status);
}
