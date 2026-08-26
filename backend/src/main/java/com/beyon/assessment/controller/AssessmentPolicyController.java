package com.beyon.assessment.controller;

import com.beyon.assessment.model.AssessmentPolicy;
import com.beyon.assessment.service.AssessmentPolicyService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/assessment-policies")
public class AssessmentPolicyController {

    private final AssessmentPolicyService policyService;
    private final JwtUtil jwtUtil;

    public AssessmentPolicyController(AssessmentPolicyService policyService, JwtUtil jwtUtil) {
        this.policyService = policyService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<?> createPolicy(@RequestBody AssessmentPolicy policy, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        policy.setCompanyUserId(userId);
        return ResponseEntity.ok(policyService.createPolicy(policy));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePolicy(@PathVariable UUID id, @RequestBody AssessmentPolicy updates) {
        return ResponseEntity.ok(policyService.updatePolicy(id, updates));
    }

    @GetMapping
    public ResponseEntity<?> getMyPolicies(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(policyService.getPoliciesByCompany(userId));
    }

    @GetMapping("/opportunity/{opportunityId}")
    public ResponseEntity<?> getPolicyByOpportunity(@PathVariable UUID opportunityId) {
        return ResponseEntity.ok(policyService.getPolicyByOpportunity(opportunityId));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            return jwtUtil.getUserId(token);
        }
        throw new RuntimeException("Unauthorized");
    }
}
