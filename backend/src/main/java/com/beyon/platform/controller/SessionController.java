package com.beyon.platform.controller;

import com.beyon.platform.service.SessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveSessions(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(sessionService.getActiveSessions(userId));
    }

    @PostMapping("/{sessionId}/revoke")
    public ResponseEntity<?> revokeSession(Authentication auth, @PathVariable UUID sessionId) {
        sessionService.revokeSession(sessionId);
        return ResponseEntity.ok(Map.of("message", "Session revoked"));
    }

    @PostMapping("/revoke-all")
    public ResponseEntity<?> revokeAllSessions(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        sessionService.revokeAllSessions(userId);
        return ResponseEntity.ok(Map.of("message", "All sessions revoked"));
    }
}
