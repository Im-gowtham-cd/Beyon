package com.beyon.intelligence.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUtil;
import com.beyon.intelligence.service.RecommendationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/recommendations")
public class RecommendationController {
    private final RecommendationService recService;
    private final JwtUtil jwtUtil;

    public RecommendationController(RecommendationService recService, JwtUtil jwtUtil) {
        this.recService = recService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<?> getRecommendations(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(recService.getRecommendations(extractUserId(request))));
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateRecommendations(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(recService.generateRecommendations(extractUserId(request))));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> markCompleted(@PathVariable UUID id, HttpServletRequest request) {
        recService.markCompleted(id, extractUserId(request));
        return ResponseEntity.ok(ApiResponse.ok(null, "Marked as completed"));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
