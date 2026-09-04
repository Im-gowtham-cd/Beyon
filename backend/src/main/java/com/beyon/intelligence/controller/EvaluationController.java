package com.beyon.intelligence.controller;

import com.beyon.intelligence.service.EvaluationService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/intelligence/evaluation")
public class EvaluationController {
    private final EvaluationService evalService;
    private final JwtUtil jwtUtil;

    public EvaluationController(EvaluationService evalService, JwtUtil jwtUtil) {
        this.evalService = evalService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/session/{sessionId}/evaluate")
    public ResponseEntity<?> evaluateSession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(evalService.evaluateSession(sessionId));
    }

    @PostMapping("/skill-intelligence/update")
    public ResponseEntity<?> updateSkillIntelligence(@RequestBody Map<String, String> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        UUID skillId = UUID.fromString(body.get("skillId"));
        evalService.updateSkillIntelligence(userId, skillId);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
