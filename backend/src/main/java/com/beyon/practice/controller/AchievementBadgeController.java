package com.beyon.practice.controller;

import com.beyon.identity.security.JwtUtil;
import com.beyon.practice.service.AchievementBadgeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/badges")
public class AchievementBadgeController {

    private final AchievementBadgeService badgeService;
    private final JwtUtil jwtUtil;

    public AchievementBadgeController(AchievementBadgeService badgeService, JwtUtil jwtUtil) {
        this.badgeService = badgeService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<?> getMyBadges(HttpServletRequest request) {
        return ResponseEntity.ok(badgeService.getBadges(extractUserId(request)));
    }

    @GetMapping("/progress")
    public ResponseEntity<?> getBadgeProgress(HttpServletRequest request) {
        return ResponseEntity.ok(badgeService.getBadgeProgress(extractUserId(request)));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
