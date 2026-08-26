package com.beyon.intelligence.controller;

import com.beyon.identity.security.JwtUtil;
import com.beyon.intelligence.service.GrowthIntelligenceService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/growth")
public class GrowthIntelligenceController {

    private final GrowthIntelligenceService growthService;
    private final JwtUtil jwtUtil;

    public GrowthIntelligenceController(GrowthIntelligenceService growthService, JwtUtil jwtUtil) {
        this.growthService = growthService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/score")
    public ResponseEntity<?> getGrowthScore(HttpServletRequest request) {
        return ResponseEntity.ok(growthService.getGrowthScore(extractUserId(request)));
    }

    @GetMapping("/insights")
    public ResponseEntity<?> getInsights(HttpServletRequest request) {
        return ResponseEntity.ok(growthService.getStudentInsights(extractUserId(request)));
    }

    @PostMapping("/compute")
    public ResponseEntity<?> computeGrowthScore(HttpServletRequest request) {
        return ResponseEntity.ok(growthService.computeGrowthScore(extractUserId(request)));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
