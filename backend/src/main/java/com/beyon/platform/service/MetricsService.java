package com.beyon.platform.service;

import com.beyon.platform.model.*;
import com.beyon.platform.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class MetricsService {
    private final PlatformMetricRepository metricRepo;

    public MetricsService(PlatformMetricRepository metricRepo) { this.metricRepo = metricRepo; }

    public void recordMetric(String name, Number value, String type, String tags) {
        PlatformMetric m = new PlatformMetric();
        m.setMetricName(name);
        m.setMetricValue(new BigDecimal(value.toString()));
        m.setMetricType(type != null ? type : "COUNTER");
        m.setTags(tags);
        metricRepo.save(m);
    }

    public void incrementCounter(String name) {
        List<PlatformMetric> existing = metricRepo.findByMetricNameOrderByRecordedAtDesc(name);
        BigDecimal newValue = existing.isEmpty() ? BigDecimal.ONE : existing.get(0).getMetricValue().add(BigDecimal.ONE);
        PlatformMetric m = new PlatformMetric();
        m.setMetricName(name);
        m.setMetricValue(newValue);
        m.setMetricType("COUNTER");
        metricRepo.save(m);
    }

    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("timestamp", OffsetDateTime.now().toString());
        health.put("uptime", ManagementFactory.getRuntimeMXBean().getUptime());
        health.put("memoryUsed", ManagementFactory.getMemoryMXBean().getHeapMemoryUsage().getUsed());
        health.put("memoryMax", ManagementFactory.getMemoryMXBean().getHeapMemoryUsage().getMax());
        health.put("threads", ManagementFactory.getThreadMXBean().getThreadCount());
        return health;
    }

    public List<PlatformMetric> getRecentMetrics(int limit) {
        return metricRepo.findTop100ByOrderByRecordedAtDesc().stream().limit(limit).toList();
    }

    private static class ManagementFactory {
        static java.lang.management.RuntimeMXBean getRuntimeMXBean() { return java.lang.management.ManagementFactory.getRuntimeMXBean(); }
        static java.lang.management.MemoryMXBean getMemoryMXBean() { return java.lang.management.ManagementFactory.getMemoryMXBean(); }
        static java.lang.management.ThreadMXBean getThreadMXBean() { return java.lang.management.ManagementFactory.getThreadMXBean(); }
    }
}
