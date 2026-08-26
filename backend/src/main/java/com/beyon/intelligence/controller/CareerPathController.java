package com.beyon.intelligence.controller;

import com.beyon.intelligence.model.CareerPath;
import com.beyon.intelligence.service.CareerPathService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/career-paths")
public class CareerPathController {
    private final CareerPathService careerPathService;
    private final JwtUtil jwtUtil;

    public CareerPathController(CareerPathService careerPathService, JwtUtil jwtUtil) {
        this.careerPathService = careerPathService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<?> createPath(@RequestBody CareerPath path) {
        return ResponseEntity.ok(careerPathService.createPath(path));
    }

    @GetMapping
    public ResponseEntity<?> getAllPaths() {
        return ResponseEntity.ok(careerPathService.getAllPaths());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<?> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(careerPathService.getBySlug(slug));
    }

    @PostMapping("/{pathId}/start")
    public ResponseEntity<?> startPath(@PathVariable UUID pathId, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(careerPathService.startPath(userId, pathId));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyPaths(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(careerPathService.getMyPaths(userId));
    }

    @GetMapping("/{pathId}/detail")
    public ResponseEntity<?> getPathDetail(@PathVariable UUID pathId, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(careerPathService.getPathDetail(pathId, userId));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
