package com.beyon.intelligence.controller;

import com.beyon.intelligence.service.MatchingService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/v1/matching")
public class MatchingController {
    private final MatchingService matchingService;
    private final JwtUtil jwtUtil;

    public MatchingController(MatchingService matchingService, JwtUtil jwtUtil) {
        this.matchingService = matchingService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/calculate")
    public ResponseEntity<?> calculateMatch(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID studentId = extractUserId(request);
        UUID opportunityId = UUID.fromString((String) body.get("opportunityId"));
        List<UUID> requiredSkills = ((List<String>) body.get("requiredSkills")).stream().map(UUID::fromString).toList();
        BigDecimal minCgpa = body.get("minCgpa") != null ? new BigDecimal(body.get("minCgpa").toString()) : null;
        String department = (String) body.get("department");
        return ResponseEntity.ok(matchingService.calculateMatch(studentId, opportunityId, requiredSkills, minCgpa, department));
    }

    @GetMapping("/opportunity/{opportunityId}/ranked")
    public ResponseEntity<?> getRankedCandidates(@PathVariable UUID opportunityId) {
        return ResponseEntity.ok(matchingService.getRankedCandidates(opportunityId));
    }

    @GetMapping("/career-readiness")
    public ResponseEntity<?> getCareerReadiness(@RequestParam UUID careerPathId, HttpServletRequest request) {
        UUID studentId = extractUserId(request);
        return ResponseEntity.ok(matchingService.getCareerReadiness(studentId, careerPathId));
    }

    @GetMapping("/skill-gaps")
    public ResponseEntity<?> getSkillGaps(@RequestParam UUID careerPathId, HttpServletRequest request) {
        UUID studentId = extractUserId(request);
        return ResponseEntity.ok(matchingService.analyzeSkillGaps(studentId, careerPathId));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
