package com.beyon.intelligence.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUtil;
import com.beyon.intelligence.service.CompanyRequirementService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/v1/requirements")
public class CompanyRequirementController {
    private final CompanyRequirementService reqService;
    private final JwtUtil jwtUtil;

    public CompanyRequirementController(CompanyRequirementService reqService, JwtUtil jwtUtil) {
        this.reqService = reqService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(ApiResponse.ok(reqService.create(userId,
            UUID.fromString((String) body.get("opportunityId")), (String) body.get("title"),
            (String) body.get("description"), (String) body.get("requiredSkills"),
            (String) body.get("preferredSkills"),
            body.get("minCgpa") != null ? new BigDecimal(body.get("minCgpa").toString()) : null,
            body.get("minExperience") != null ? (Integer) body.get("minExperience") : null,
            body.get("coinCost") != null ? (Integer) body.get("coinCost") : null)));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyRequirements(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(reqService.getByCompany(extractUserId(request))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(reqService.getById(id)));
    }

    @GetMapping("/opportunity/{opportunityId}")
    public ResponseEntity<?> getByOpportunity(@PathVariable UUID opportunityId) {
        return ResponseEntity.ok(ApiResponse.ok(reqService.getByOpportunity(opportunityId)));
    }

    @PostMapping("/{id}/check-eligibility")
    public ResponseEntity<?> checkEligibility(@PathVariable UUID id, @RequestBody Map<String, Object> body, HttpServletRequest request) {
        BigDecimal cgpa = body.get("cgpa") != null ? new BigDecimal(body.get("cgpa").toString()) : null;
        int experience = body.get("experience") != null ? (Integer) body.get("experience") : 0;
        @SuppressWarnings("unchecked")
        List<String> skills = (List<String>) body.getOrDefault("skills", List.of());
        return ResponseEntity.ok(ApiResponse.ok(reqService.checkEligibility(id, cgpa, experience, skills)));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
