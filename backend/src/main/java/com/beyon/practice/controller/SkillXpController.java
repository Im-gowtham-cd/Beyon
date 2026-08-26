package com.beyon.practice.controller;

import com.beyon.identity.security.JwtUtil;
import com.beyon.practice.service.SkillXpService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/xp")
public class SkillXpController {

    private final SkillXpService xpService;
    private final JwtUtil jwtUtil;

    public SkillXpController(SkillXpService xpService, JwtUtil jwtUtil) {
        this.xpService = xpService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/levels")
    public ResponseEntity<?> getSkillLevels(HttpServletRequest request) {
        return ResponseEntity.ok(xpService.getSkillLevels(extractUserId(request)));
    }

    @GetMapping("/skills/{skillId}")
    public ResponseEntity<?> getSkillDetail(@PathVariable UUID skillId, HttpServletRequest request) {
        return ResponseEntity.ok(xpService.getSkillDetail(extractUserId(request), skillId));
    }

    @PostMapping("/earn")
    public ResponseEntity<?> earnXp(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID skillId = UUID.fromString((String) body.get("skillId"));
        int amount = (Integer) body.get("amount");
        String source = (String) body.get("source");
        UUID sourceId = body.get("sourceId") != null ? UUID.fromString((String) body.get("sourceId")) : null;
        String description = (String) body.getOrDefault("description", "");
        return ResponseEntity.ok(xpService.earnXp(extractUserId(request), skillId, amount, source, sourceId, description));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
