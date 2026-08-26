package com.beyon.intelligence.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUtil;
import com.beyon.intelligence.service.AnalyticsService;
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

    @PostMapping("/events")
    public ResponseEntity<?> trackEvent(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        analyticsService.trackEvent(userId, (String) body.get("userRole"), (String) body.get("eventType"),
            (Map<String, Object>) body.get("eventData"), (String) body.get("page"));
        return ResponseEntity.ok(ApiResponse.ok(null, "Event tracked"));
    }

    @GetMapping("/student")
    public ResponseEntity<?> getStudentAnalytics(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getStudentAnalytics(extractUserId(request))));
    }

    @GetMapping("/institution/{id}")
    public ResponseEntity<?> getInstitutionAnalytics(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getInstitutionAnalytics(id)));
    }

    @GetMapping("/company/{id}")
    public ResponseEntity<?> getCompanyAnalytics(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getCompanyAnalytics(id)));
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getAdminAnalytics() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getAdminAnalytics()));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
