package com.beyon.intelligence.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUtil;
import com.beyon.intelligence.service.CareerRoadmapService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/roadmap")
public class CareerRoadmapController {
    private final CareerRoadmapService roadmapService;
    private final JwtUtil jwtUtil;

    public CareerRoadmapController(CareerRoadmapService roadmapService, JwtUtil jwtUtil) {
        this.roadmapService = roadmapService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/{careerPathId}")
    public ResponseEntity<?> getRoadmap(@PathVariable UUID careerPathId, HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(roadmapService.getRoadmap(extractUserId(request), careerPathId)));
    }

    @PostMapping("/{careerPathId}/generate")
    public ResponseEntity<?> generateRoadmap(@PathVariable UUID careerPathId, HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(roadmapService.generateRoadmap(extractUserId(request), careerPathId)));
    }

    @PostMapping("/{itemId}/start")
    public ResponseEntity<?> startItem(@PathVariable UUID itemId, HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(roadmapService.startItem(itemId, extractUserId(request))));
    }

    @PostMapping("/{itemId}/complete")
    public ResponseEntity<?> completeItem(@PathVariable UUID itemId, HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(roadmapService.completeItem(itemId, extractUserId(request))));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
