package com.beyon.platform.controller;

import com.beyon.platform.repository.SecurityAuditLogRepository;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/audit")
public class AuditController {
    private final SecurityAuditLogRepository auditRepo;
    private final JwtUtil jwtUtil;

    public AuditController(SecurityAuditLogRepository auditRepo, JwtUtil jwtUtil) {
        this.auditRepo = auditRepo;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/my-activity")
    public ResponseEntity<?> getMyActivity(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(auditRepo.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @GetMapping("/security")
    public ResponseEntity<?> getSecurityLogs(@RequestParam(required = false) String action) {
        if (action != null) return ResponseEntity.ok(auditRepo.findByActionOrderByCreatedAtDesc(action));
        return ResponseEntity.ok(auditRepo.findAll());
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
