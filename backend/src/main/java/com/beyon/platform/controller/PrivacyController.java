package com.beyon.platform.controller;

import com.beyon.identity.security.JwtUtil;
import com.beyon.platform.service.PrivacyService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/privacy")
public class PrivacyController {
    private final PrivacyService privacyService;
    private final JwtUtil jwtUtil;

    public PrivacyController(PrivacyService privacyService, JwtUtil jwtUtil) {
        this.privacyService = privacyService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings(HttpServletRequest request) {
        return ResponseEntity.ok(privacyService.getOrCreateSettings(extractUserId(request)));
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, Object> updates, HttpServletRequest request) {
        return ResponseEntity.ok(privacyService.updateSettings(extractUserId(request), updates));
    }

    @PostMapping("/consent")
    public ResponseEntity<?> recordConsent(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        privacyService.recordConsent(userId, (String) body.get("consentType"),
            (Boolean) body.get("granted"), request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/consent/{type}")
    public ResponseEntity<?> checkConsent(@PathVariable String type, HttpServletRequest request) {
        return ResponseEntity.ok(Map.of("granted", privacyService.hasConsent(extractUserId(request), type)));
    }

    @GetMapping("/export")
    public ResponseEntity<?> exportData(HttpServletRequest request) {
        return ResponseEntity.ok(privacyService.exportUserData(extractUserId(request)));
    }

    @PostMapping("/delete-request")
    public ResponseEntity<?> requestDeletion(HttpServletRequest request) {
        privacyService.requestDataDeletion(extractUserId(request), request.getRemoteAddr());
        return ResponseEntity.ok(Map.of("message", "Deletion request received. It will be processed within 30 days."));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
