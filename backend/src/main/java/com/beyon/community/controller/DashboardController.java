package com.beyon.community.controller;

import com.beyon.community.service.DashboardService;
import com.beyon.community.service.SmartNotificationService;
import com.beyon.community.service.ReputationService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;
    private final SmartNotificationService notifService;
    private final ReputationService repService;
    private final JwtUtil jwtUtil;

    public DashboardController(DashboardService dashboardService, SmartNotificationService notifService, ReputationService repService, JwtUtil jwtUtil) {
        this.dashboardService = dashboardService;
        this.notifService = notifService;
        this.repService = repService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<?> getDashboard(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(dashboardService.getPersonalizedDashboard(userId));
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(HttpServletRequest request) {
        return ResponseEntity.ok(notifService.getNotifications(extractUserId(request)));
    }

    @GetMapping("/notifications/unread")
    public ResponseEntity<?> getUnreadNotifications(HttpServletRequest request) {
        return ResponseEntity.ok(notifService.getUnread(extractUserId(request)));
    }

    @GetMapping("/notifications/unread/count")
    public ResponseEntity<?> getUnreadCount(HttpServletRequest request) {
        return ResponseEntity.ok(Map.of("count", notifService.getUnreadCount(extractUserId(request))));
    }

    @PostMapping("/notifications/{id}/read")
    public ResponseEntity<?> markNotificationRead(@PathVariable UUID id) {
        notifService.markRead(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/notifications/read-all")
    public ResponseEntity<?> markAllRead(HttpServletRequest request) {
        int count = notifService.markAllRead(extractUserId(request));
        return ResponseEntity.ok(Map.of("marked", count));
    }

    @GetMapping("/reputation")
    public ResponseEntity<?> getReputation(HttpServletRequest request) {
        return ResponseEntity.ok(repService.getReputationSummary(extractUserId(request)));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
