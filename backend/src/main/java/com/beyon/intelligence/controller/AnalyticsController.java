package com.beyon.intelligence.controller;

import com.beyon.intelligence.service.AnalyticsService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {
    private final AnalyticsService analyticsService;
    private final JwtUtil jwtUtil;

    public AnalyticsController(AnalyticsService analyticsService, JwtUtil jwtUtil) {
        this.analyticsService = analyticsService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/institution")
    public ResponseEntity<?> getInstitutionAnalytics(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(analyticsService.getLatestInstitutionAnalytics(userId));
    }

    @PostMapping("/institution/generate")
    public ResponseEntity<?> generateInstitutionAnalytics(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(analyticsService.generateInstitutionAnalytics(userId));
    }

    @GetMapping("/company")
    public ResponseEntity<?> getCompanyAnalytics(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(analyticsService.getLatestCompanyAnalytics(userId));
    }

    @PostMapping("/company/generate")
    public ResponseEntity<?> generateCompanyAnalytics(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(analyticsService.generateCompanyAnalytics(userId));
    }

    @GetMapping("/skill-demand")
    public ResponseEntity<?> getSkillDemand(@RequestParam(required = false) UUID institutionId) {
        return ResponseEntity.ok(analyticsService.getSkillDemandAnalytics(institutionId));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
