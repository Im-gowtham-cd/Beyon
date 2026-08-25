package com.beyon.platform.controller;

import com.beyon.platform.repository.BackgroundJobRepository;
import com.beyon.platform.repository.SecurityAuditLogRepository;
import com.beyon.community.repository.SmartNotificationRepository;
import com.beyon.platform.service.CacheService;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/monitoring")
public class MonitoringController {
    private final BackgroundJobRepository jobRepo;
    private final SecurityAuditLogRepository auditRepo;
    private final SmartNotificationRepository notifRepo;
    private final StringRedisTemplate redis;
    private final MemoryMXBean memory = ManagementFactory.getMemoryMXBean();

    public MonitoringController(BackgroundJobRepository jobRepo, SecurityAuditLogRepository auditRepo,
                                SmartNotificationRepository notifRepo, StringRedisTemplate redis) {
        this.jobRepo = jobRepo;
        this.auditRepo = auditRepo;
        this.notifRepo = notifRepo;
        this.redis = redis;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> monitoringDashboard() {
        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("timestamp", OffsetDateTime.now().toString());

        Map<String, Object> jobs = new LinkedHashMap<>();
        jobs.put("pending", jobRepo.countByStatus("PENDING"));
        jobs.put("processing", jobRepo.countByStatus("PROCESSING"));
        jobs.put("completed", jobRepo.countByStatus("COMPLETED"));
        jobs.put("failed", jobRepo.countByStatus("FAILED"));
        dashboard.put("backgroundJobs", jobs);

        Map<String, Object> security = new LinkedHashMap<>();
        security.put("totalAuditEntries", auditRepo.count());
        dashboard.put("security", security);

        Map<String, Object> jvm = new LinkedHashMap<>();
        jvm.put("heapUsedMB", memory.getHeapMemoryUsage().getUsed() / 1024 / 1024);
        jvm.put("heapMaxMB", memory.getHeapMemoryUsage().getMax() / 1024 / 1024);
        jvm.put("uptimeMs", ManagementFactory.getRuntimeMXBean().getUptime());
        dashboard.put("jvm", jvm);

        boolean redisUp = false;
        try { redisUp = redis.getConnectionFactory().getConnection().ping() != null; } catch (Exception ignored) {}
        dashboard.put("redis", redisUp ? "connected" : "disconnected");

        return ResponseEntity.ok(dashboard);
    }
}
