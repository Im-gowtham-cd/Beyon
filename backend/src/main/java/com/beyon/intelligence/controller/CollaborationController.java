package com.beyon.intelligence.controller;

import com.beyon.intelligence.model.*;
import com.beyon.intelligence.service.CollaborationService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/v1/collaboration")
public class CollaborationController {
    private final CollaborationService collabService;
    private final JwtUtil jwtUtil;

    public CollaborationController(CollaborationService collabService, JwtUtil jwtUtil) {
        this.collabService = collabService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/programs")
    public ResponseEntity<?> createProgram(@RequestBody CollaborationProgram program, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        program.setHostUserId(userId);
        return ResponseEntity.ok(collabService.createProgram(program));
    }

    @PostMapping("/programs/{id}/publish")
    public ResponseEntity<?> publishProgram(@PathVariable UUID id) {
        return ResponseEntity.ok(collabService.publishProgram(id));
    }

    @GetMapping("/programs")
    public ResponseEntity<?> getPublishedPrograms() {
        return ResponseEntity.ok(collabService.getPublishedPrograms());
    }

    @GetMapping("/programs/my")
    public ResponseEntity<?> getMyPrograms(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(collabService.getMyPrograms(userId));
    }

    @PostMapping("/programs/{id}/register")
    public ResponseEntity<?> register(@PathVariable UUID id, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(collabService.register(id, userId));
    }

    @PostMapping("/programs/{id}/complete")
    public ResponseEntity<?> completeProgram(@PathVariable UUID id, @RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        String feedback = (String) body.get("feedback");
        BigDecimal rating = body.get("rating") != null ? new BigDecimal(body.get("rating").toString()) : null;
        return ResponseEntity.ok(collabService.completeProgram(id, userId, feedback, rating));
    }

    @GetMapping("/registrations/my")
    public ResponseEntity<?> getMyRegistrations(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(collabService.getMyRegistrations(userId));
    }

    @GetMapping("/programs/{id}/stats")
    public ResponseEntity<?> getProgramStats(@PathVariable UUID id) {
        return ResponseEntity.ok(collabService.getProgramStats(id));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
