package com.beyon.recruitment.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.recruitment.model.RecruitmentApplication;
import com.beyon.recruitment.model.RecruitmentStatusHistory;
import com.beyon.recruitment.service.RecruitmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruitment")
public class RecruitmentController {

    private final RecruitmentService recruitmentService;

    public RecruitmentController(RecruitmentService recruitmentService) {
        this.recruitmentService = recruitmentService;
    }

    @GetMapping("/my-applications")
    public ResponseEntity<ApiResponse<List<RecruitmentApplication>>> getMyApplications(Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(recruitmentService.getStudentApplications(studentId)));
    }

    @GetMapping("/opportunity/{opportunityId}/applications")
    public ResponseEntity<ApiResponse<List<RecruitmentApplication>>> getApplications(@PathVariable UUID opportunityId) {
        return ResponseEntity.ok(ApiResponse.ok(recruitmentService.getOpportunityApplications(opportunityId)));
    }

    @GetMapping("/drive/{driveId}/applications")
    public ResponseEntity<ApiResponse<List<RecruitmentApplication>>> getDriveApplications(@PathVariable UUID driveId) {
        return ResponseEntity.ok(ApiResponse.ok(recruitmentService.getDriveApplications(driveId)));
    }

    @PutMapping("/{applicationId}/status")
    public ResponseEntity<ApiResponse<RecruitmentApplication>> updateStatus(
            Authentication auth,
            @PathVariable UUID applicationId,
            @RequestBody Map<String, String> body) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(recruitmentService.updateStatus(applicationId, body.get("status"), userId, body.get("notes"))));
    }

    @PostMapping("/{applicationId}/withdraw")
    public ResponseEntity<ApiResponse<RecruitmentApplication>> withdraw(Authentication auth, @PathVariable UUID applicationId) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(recruitmentService.withdraw(studentId, applicationId)));
    }

    @GetMapping("/opportunity/{opportunityId}/pipeline")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getPipeline(@PathVariable UUID opportunityId) {
        return ResponseEntity.ok(ApiResponse.ok(recruitmentService.getPipelineStats(opportunityId)));
    }

    @GetMapping("/{applicationId}/history")
    public ResponseEntity<ApiResponse<List<RecruitmentStatusHistory>>> getHistory(@PathVariable UUID applicationId) {
        return ResponseEntity.ok(ApiResponse.ok(recruitmentService.getStatusHistory(applicationId)));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
