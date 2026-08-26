package com.beyon.platform.repository;

import com.beyon.platform.model.PlatformMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PlatformMetricRepository extends JpaRepository<PlatformMetric, UUID> {
    List<PlatformMetric> findByMetricNameOrderByRecordedAtDesc(String metricName);
    List<PlatformMetric> findTop100ByOrderByRecordedAtDesc();
}
