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

    @PostMapping("/stats")
    public ResponseEntity<ApiResponse<PlatformDailyStats>> recordStats(@RequestBody PlatformDailyStats stats) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.recordDailyStats(stats)));
    }
}
