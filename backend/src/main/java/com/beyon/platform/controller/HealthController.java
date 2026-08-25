package com.beyon.platform.controller;

import com.beyon.platform.service.MetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {
    private final MetricsService metricsService;

    public HealthController(MetricsService metricsService) { this.metricsService = metricsService; }

    @GetMapping("/health")
    public ResponseEntity<?> health() { return ResponseEntity.ok(metricsService.getSystemHealth()); }

    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics(@RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(metricsService.getRecentMetrics(limit));
    }

    @GetMapping("/ready")
    public ResponseEntity<?> ready() { return ResponseEntity.ok(Map.of("status", "READY")); }
}
