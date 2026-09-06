package com.beyon.assessment.controller;

import com.beyon.assessment.service.AssessmentReattemptService;
import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
public class AssessmentReattemptController {

    private final AssessmentReattemptService reattemptService;
    private final JwtUtil jwtUtil;

    public AssessmentReattemptController(AssessmentReattemptService reattemptService, JwtUtil jwtUtil) {
        this.reattemptService = reattemptService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/api/v1/assessment/reattempt-request")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitReattemptRequest(
            Authentication auth,
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        UUID studentId = extractUserId(auth, request);
        UUID opportunityId = UUID.fromString((String) body.get("opportunityId"));
        String studentReason = (String) body.get("studentReason");
        String terminationReason = (String) body.get("terminationReason");

        Map<String, Object> result = reattemptService.submitReattemptRequest(
                studentId, opportunityId, studentReason, terminationReason
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/api/v1/assessment/my-reattempts")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyReattemptRequests(
            Authentication auth,
            HttpServletRequest request) {
        UUID studentId = extractUserId(auth, request);
        return ResponseEntity.ok(ApiResponse.ok(reattemptService.getStudentReattemptRequests(studentId)));
    }

    @GetMapping("/api/v1/company/reattempts")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCompanyReattemptRequests(
            Authentication auth,
            HttpServletRequest request) {
        UUID companyUserId = extractUserId(auth, request);
        return ResponseEntity.ok(ApiResponse.ok(reattemptService.getCompanyReattemptRequests(companyUserId)));
    }

    @PostMapping("/api/v1/company/reattempts/{id}/approve")
    public ResponseEntity<ApiResponse<Map<String, Object>>> approveReattempt(
            Authentication auth,
            HttpServletRequest request,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Object> body) {
        UUID companyUserId = extractUserId(auth, request);
        String notes = body != null ? (String) body.get("reviewNotes") : null;
        Map<String, Object> result = reattemptService.approveReattemptRequest(id, companyUserId, notes);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/api/v1/company/reattempts/{id}/reject")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rejectReattempt(
            Authentication auth,
            HttpServletRequest request,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Object> body) {
        UUID companyUserId = extractUserId(auth, request);
        String notes = body != null ? (String) body.get("reviewNotes") : null;
        Map<String, Object> result = reattemptService.rejectReattemptRequest(id, companyUserId, notes);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    private UUID extractUserId(Authentication auth, HttpServletRequest request) {
        if (auth != null && auth.getDetails() instanceof JwtUserDetails details) {
            return UUID.fromString(details.getUserId());
        }
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                return jwtUtil.getUserId(authHeader.substring(7));
            }
        } catch (Exception ignored) {}
        throw new com.beyon.common.exception.UnauthorizedException("Missing or invalid authentication token");
    }
}

