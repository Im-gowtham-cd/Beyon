package com.beyon.platform.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.platform.model.PlatformDailyStats;
import com.beyon.platform.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminService;

    public AdminDashboardController(AdminDashboardService adminService) { this.adminService = adminService; }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getDashboard()));
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> overview() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getOverview()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> users(@RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getRecentUsers(limit)));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getSystemHealth()));
    }

    @GetMapping("/institutions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> institutions() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getInstitutions()));
    }

    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> companies() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getCompanies()));
    }

    @GetMapping("/economy")
    public ResponseEntity<ApiResponse<Map<String, Object>>> economy() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getCoinEconomy()));
    }

    @PostMapping("/stats")
    public ResponseEntity<ApiResponse<PlatformDailyStats>> recordStats(@RequestBody PlatformDailyStats stats) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.recordDailyStats(stats)));
    }
}
