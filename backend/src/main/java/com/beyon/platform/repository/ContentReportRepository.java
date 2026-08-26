package com.beyon.platform.repository;

import com.beyon.platform.model.ContentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ContentReportRepository extends JpaRepository<ContentReport, UUID> {
    List<ContentReport> findByStatus(String status);
    List<ContentReport> findByTargetTypeAndTargetId(String targetType, UUID targetId);
    List<ContentReport> findByReporterId(UUID reporterId);
}
