package com.beyon.recruitment.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.recruitment.model.CandidateShortlist;
import com.beyon.recruitment.service.CandidateDiscoveryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/candidates")
public class CandidateDiscoveryController {

    private final CandidateDiscoveryService candidateService;

    public CandidateDiscoveryController(CandidateDiscoveryService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping("/drive/{driveId}/eligible")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkEligibility(
            @PathVariable UUID driveId, Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(candidateService.checkEligibility(studentId, driveId)));
    }

    @PostMapping("/drive/{driveId}/auto-shortlist")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> autoShortlist(
            @PathVariable UUID driveId, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(candidateService.autoShortlist(driveId, extractUserId(auth))));
    }

    @PostMapping("/drive/{driveId}/shortlist/{studentId}")
    public ResponseEntity<ApiResponse<CandidateShortlist>> shortlist(
            @PathVariable UUID driveId, @PathVariable UUID studentId,
            @RequestParam(required = false) UUID pipelineId, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(
            candidateService.shortlistCandidate(driveId, studentId, pipelineId, extractUserId(auth))));
    }

    @GetMapping("/drive/{driveId}/shortlist")
    public ResponseEntity<ApiResponse<List<CandidateShortlist>>> getShortlist(@PathVariable UUID driveId) {
        return ResponseEntity.ok(ApiResponse.ok(candidateService.getDriveShortlist(driveId)));
    }

    @PutMapping("/shortlist/{shortlistId}/status")
    public ResponseEntity<ApiResponse<CandidateShortlist>> updateShortlistStatus(
            @PathVariable UUID shortlistId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(
            candidateService.updateShortlistStatus(shortlistId, body.get("status"), body.get("notes"))));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
