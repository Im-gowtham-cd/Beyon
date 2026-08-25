package com.beyon.recruitment.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUtil;
import com.beyon.recruitment.service.RecruitmentPipelineService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/v1/pipeline")
public class RecruitmentPipelineController {
    private final RecruitmentPipelineService pipelineService;
    private final JwtUtil jwtUtil;

    public RecruitmentPipelineController(RecruitmentPipelineService pipelineService, JwtUtil jwtUtil) {
        this.pipelineService = pipelineService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/apply")
    public ResponseEntity<?> apply(@RequestBody Map<String, String> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(ApiResponse.ok(pipelineService.apply(
            UUID.fromString(body.get("opportunityId")), UUID.fromString(body.get("companyId")), userId)));
    }

    @PostMapping("/{id}/move/{stage}")
    public ResponseEntity<?> moveToStage(@PathVariable UUID id, @PathVariable String stage) {
        return ResponseEntity.ok(ApiResponse.ok(pipelineService.moveToStage(id, stage)));
    }

    @PostMapping("/{id}/shortlist")
    public ResponseEntity<?> shortlist(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(pipelineService.shortlist(id, body.get("notes"))));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(pipelineService.reject(id, body.get("notes"))));
    }

    @PostMapping("/{id}/offer")
    public ResponseEntity<?> generateOffer(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok(pipelineService.generateOffer(id,
            (String) body.get("jobRole"),
            body.get("packageAmount") != null ? new BigDecimal(body.get("packageAmount").toString()) : null,
            (String) body.get("companyTier"))));
    }

    @PostMapping("/offer/{offerId}/accept")
    public ResponseEntity<?> acceptOffer(@PathVariable UUID offerId, HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(pipelineService.acceptOffer(offerId, extractUserId(request))));
    }

    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(pipelineService.getStudentApplications(extractUserId(request))));
    }

    @GetMapping("/company")
    public ResponseEntity<?> getCompanyPipeline(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(pipelineService.getCompanyPipeline(extractUserId(request))));
    }

    @GetMapping("/opportunity/{opportunityId}")
    public ResponseEntity<?> getByOpportunity(@PathVariable UUID opportunityId) {
        return ResponseEntity.ok(ApiResponse.ok(pipelineService.getByOpportunity(opportunityId)));
    }

    @GetMapping("/opportunity/{opportunityId}/stats")
    public ResponseEntity<?> getStats(@PathVariable UUID opportunityId) {
        return ResponseEntity.ok(ApiResponse.ok(pipelineService.getPipelineStats(opportunityId)));
    }

    @GetMapping("/offers")
    public ResponseEntity<?> getMyOffers(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(pipelineService.getStudentOffers(extractUserId(request))));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
