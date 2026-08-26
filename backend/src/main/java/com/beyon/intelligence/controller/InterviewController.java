package com.beyon.intelligence.controller;

import com.beyon.intelligence.model.*;
import com.beyon.intelligence.service.InterviewService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/interviews")
public class InterviewController {
    private final InterviewService interviewService;
    private final JwtUtil jwtUtil;

    public InterviewController(InterviewService interviewService, JwtUtil jwtUtil) {
        this.interviewService = interviewService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/rounds")
    public ResponseEntity<?> createRound(@RequestBody InterviewRound round) {
        return ResponseEntity.ok(interviewService.createRound(round));
    }

    @GetMapping("/rounds/opportunity/{opportunityId}")
    public ResponseEntity<?> getRounds(@PathVariable UUID opportunityId) {
        return ResponseEntity.ok(interviewService.getRounds(opportunityId));
    }

    @PostMapping("/schedule")
    public ResponseEntity<?> scheduleInterview(@RequestBody InterviewSchedule schedule) {
        return ResponseEntity.ok(interviewService.scheduleInterview(schedule));
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<?> getApplicationInterviews(@PathVariable UUID applicationId) {
        return ResponseEntity.ok(interviewService.getApplicationInterviews(applicationId));
    }

    @PostMapping("/scorecard")
    public ResponseEntity<?> submitScorecard(@RequestBody InterviewScorecard scorecard, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        scorecard.setInterviewerId(userId);
        return ResponseEntity.ok(interviewService.submitScorecard(scorecard));
    }

    @GetMapping("/application/{applicationId}/summary")
    public ResponseEntity<?> getInterviewSummary(@PathVariable UUID applicationId) {
        return ResponseEntity.ok(interviewService.getInterviewSummary(applicationId));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
