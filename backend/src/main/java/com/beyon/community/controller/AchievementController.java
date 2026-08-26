package com.beyon.community.controller;

import com.beyon.community.model.VerifiedAchievement;
import com.beyon.community.service.AchievementService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/achievements")
public class AchievementController {
    private final AchievementService achievementService;
    private final JwtUtil jwtUtil;

    public AchievementController(AchievementService achievementService, JwtUtil jwtUtil) {
        this.achievementService = achievementService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody VerifiedAchievement achievement, HttpServletRequest request) {
        return ResponseEntity.ok(achievementService.submitAchievement(extractUserId(request), achievement));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyAchievements(HttpServletRequest request) {
        return ResponseEntity.ok(achievementService.getMyAchievements(extractUserId(request)));
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPending() { return ResponseEntity.ok(achievementService.getPendingVerifications()); }

    @PostMapping("/{id}/verify")
    public ResponseEntity<?> verify(@PathVariable UUID id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        return ResponseEntity.ok(achievementService.verify(id, extractUserId(request), body.get("status")));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
