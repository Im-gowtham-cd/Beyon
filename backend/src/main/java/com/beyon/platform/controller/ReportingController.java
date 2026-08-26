package com.beyon.platform.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.platform.model.PlatformReport;
import com.beyon.platform.service.ReportingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportingController {

    private final ReportingService reportService;

    public ReportingController(ReportingService reportService) { this.reportService = reportService; }

    @PostMapping
    public ResponseEntity<ApiResponse<PlatformReport>> requestReport(@RequestBody Map<String, Object> body, Authentication auth) {
        UUID userId = extractUserId(auth);
        Map<String, Object> params = body.get("parameters") instanceof Map ? (Map<String, Object>) body.get("parameters") : Map.of();
        return ResponseEntity.ok(ApiResponse.ok(reportService.requestReport(userId,
            (String) body.get("type"), (String) body.get("title"), params, (String) body.get("format"))));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<PlatformReport>>> myReports(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getMyReports(extractUserId(auth))));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<PlatformReport>>> pendingReports() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getPendingReports()));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
