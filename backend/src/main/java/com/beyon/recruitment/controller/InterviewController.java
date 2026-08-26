package com.beyon.recruitment.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.recruitment.model.RecruitmentInterview;
import com.beyon.recruitment.service.InterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/recruitment-interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecruitmentInterview>> schedule(@RequestBody RecruitmentInterview interview) {
        return ResponseEntity.ok(ApiResponse.ok(interviewService.scheduleInterview(interview)));
    }

    @GetMapping("/drive/{driveId}")
    public ResponseEntity<ApiResponse<List<RecruitmentInterview>>> getDriveInterviews(@PathVariable UUID driveId) {
        return ResponseEntity.ok(ApiResponse.ok(interviewService.getDriveInterviews(driveId)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<RecruitmentInterview>>> getMyInterviews(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(interviewService.getMyInterviews(extractUserId(auth))));
    }

    @GetMapping("/pipeline/{pipelineId}")
    public ResponseEntity<ApiResponse<List<RecruitmentInterview>>> getPipelineInterviews(@PathVariable UUID pipelineId) {
        return ResponseEntity.ok(ApiResponse.ok(interviewService.getPipelineInterviews(pipelineId)));
    }

    @PostMapping("/{interviewId}/feedback")
    public ResponseEntity<ApiResponse<RecruitmentInterview>> submitFeedback(
            @PathVariable UUID interviewId, @RequestBody Map<String, Object> body) {
        String feedback = (String) body.getOrDefault("feedback", "");
        BigDecimal score = body.get("score") != null ? new BigDecimal(body.get("score").toString()) : null;
        String recommendation = (String) body.get("recommendation");
        return ResponseEntity.ok(ApiResponse.ok(interviewService.submitFeedback(interviewId, feedback, score, recommendation)));
    }

    @PostMapping("/{interviewId}/reschedule")
    public ResponseEntity<ApiResponse<RecruitmentInterview>> reschedule(
            @PathVariable UUID interviewId, @RequestBody Map<String, String> body) {
        OffsetDateTime newTime = OffsetDateTime.parse(body.get("scheduledAt"));
        return ResponseEntity.ok(ApiResponse.ok(interviewService.reschedule(interviewId, newTime)));
    }

    @PostMapping("/{interviewId}/cancel")
    public ResponseEntity<ApiResponse<RecruitmentInterview>> cancel(@PathVariable UUID interviewId) {
        return ResponseEntity.ok(ApiResponse.ok(interviewService.cancel(interviewId)));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUpcoming(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(interviewService.getUpcoming(extractUserId(auth))));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
