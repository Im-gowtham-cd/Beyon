package com.beyon.community.controller;

import com.beyon.community.service.VerificationService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/verifications")
public class VerificationController {
    private final VerificationService verificationService;
    private final JwtUtil jwtUtil;

    public VerificationController(VerificationService verificationService, JwtUtil jwtUtil) {
        this.verificationService = verificationService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/project")
    public ResponseEntity<?> submitProjectVerification(@RequestBody Map<String, String> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(verificationService.submitProjectVerification(
            UUID.fromString(body.get("projectId")), userId,
            body.get("verificationType"), body.get("evidenceUrl")));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getProjectVerifications(@PathVariable UUID projectId) {
        return ResponseEntity.ok(verificationService.getProjectVerifications(projectId));
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<?> verifyEntity(@PathVariable UUID id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(verificationService.verifyEntity(id, userId, body.get("status")));
    }

    @GetMapping("/entity/{entityId}")
    public ResponseEntity<?> checkEntityVerified(@PathVariable UUID entityId, @RequestParam String entityType) {
        return ResponseEntity.ok(Map.of("verified", verificationService.isEntityVerified(entityId, entityType)));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
