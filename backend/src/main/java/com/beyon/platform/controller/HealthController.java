package com.beyon.platform.controller;

import com.beyon.platform.service.BackgroundJobService;
import com.beyon.platform.service.CacheService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.RuntimeMXBean;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {
    private final BackgroundJobService jobService;
    private final StringRedisTemplate redis;
    private final RuntimeMXBean runtime = ManagementFactory.getRuntimeMXBean();
    private final MemoryMXBean memory = ManagementFactory.getMemoryMXBean();

    @Value("${spring.application.name:beyon-backend}")
    private String appName;

    public HealthController(BackgroundJobService jobService, StringRedisTemplate redis) {
        this.jobService = jobService;
        this.redis = redis;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("timestamp", OffsetDateTime.now().toString());
        health.put("uptime", runtime.getUptime() / 1000 + "s");

        boolean redisUp = false;
        try { redisUp = Boolean.TRUE.equals(redis.getConnectionFactory().getConnection().ping() != null); } catch (Exception ignored) {}
        health.put("redis", redisUp ? "UP" : "DOWN");

        health.put("pendingJobs", jobService.getPendingCount());
        health.put("failedJobs", jobService.getFailedCount());
        return ResponseEntity.ok(health);
    }

    @GetMapping("/ready")
    public ResponseEntity<Map<String, Object>> ready() {
        Map<String, Object> ready = new LinkedHashMap<>();
        ready.put("status", "READY");
        ready.put("service", appName);
        ready.put("timestamp", OffsetDateTime.now().toString());
        return ResponseEntity.ok(ready);
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> metrics() {
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("service", appName);
        metrics.put("timestamp", OffsetDateTime.now().toString());

        Map<String, Object> jvm = new LinkedHashMap<>();
        jvm.put("uptimeMs", runtime.getUptime());
        jvm.put("availableProcessors", Runtime.getRuntime().availableProcessors());
        jvm.put("heapUsedMB", memory.getHeapMemoryUsage().getUsed() / 1024 / 1024);
        jvm.put("heapMaxMB", memory.getHeapMemoryUsage().getMax() / 1024 / 1024);
        metrics.put("jvm", jvm);

        Map<String, Object> jobs = new LinkedHashMap<>();
        jobs.put("pending", jobService.getPendingCount());
        jobs.put("failed", jobService.getFailedCount());
        metrics.put("backgroundJobs", jobs);

        boolean redisUp = false;
        try { redisUp = Boolean.TRUE.equals(redis.getConnectionFactory().getConnection().ping() != null); } catch (Exception ignored) {}
        metrics.put("redis", redisUp ? "connected" : "disconnected");

        return ResponseEntity.ok(metrics);
    }
}
