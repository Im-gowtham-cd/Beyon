package com.beyon.community.controller;

import com.beyon.community.service.NotificationPreferenceService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/notification-preferences")
public class NotificationPreferencesController {
    private final NotificationPreferenceService prefService;
    private final JwtUtil jwtUtil;

    public NotificationPreferencesController(NotificationPreferenceService prefService, JwtUtil jwtUtil) {
        this.prefService = prefService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<?> getPreferences(HttpServletRequest request) {
        return ResponseEntity.ok(prefService.getPreferences(extractUserId(request)));
    }

    @PutMapping
    public ResponseEntity<?> updatePreference(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        String type = (String) body.get("notificationType");
        Boolean inApp = body.get("inAppEnabled") != null ? (Boolean) body.get("inAppEnabled") : null;
        Boolean email = body.get("emailEnabled") != null ? (Boolean) body.get("emailEnabled") : null;
        Boolean push = body.get("pushEnabled") != null ? (Boolean) body.get("pushEnabled") : null;
        return ResponseEntity.ok(prefService.updatePreference(userId, type, inApp, email, push));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
