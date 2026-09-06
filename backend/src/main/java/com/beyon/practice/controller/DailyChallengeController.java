package com.beyon.practice.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.practice.model.DailyChallenge;
import com.beyon.practice.service.DailyChallengeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/daily-challenge")
public class DailyChallengeController {

    private final DailyChallengeService dailyChallengeService;

    public DailyChallengeController(DailyChallengeService dailyChallengeService) {
        this.dailyChallengeService = dailyChallengeService;
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<DailyChallenge>> getToday(Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(dailyChallengeService.getTodayChallenge(studentId)));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<ApiResponse<DailyChallenge>> start(Authentication auth, @PathVariable UUID id) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(dailyChallengeService.startChallenge(studentId, id)));
    }

    @GetMapping("/set")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDailySet(
            Authentication auth,
            @RequestParam(defaultValue = "15") int count) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(dailyChallengeService.getRecommendedDailySet(studentId, count)));
    }

    @GetMapping("/recall-set")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getReviseRecallSet(
            Authentication auth,
            @RequestParam(defaultValue = "10") int count) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(dailyChallengeService.getReviseRecallSet(studentId, count)));
    }

    @PostMapping("/submit-sprint")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitSprint(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        UUID studentId = extractUserId(auth);
        UUID questionId = UUID.fromString(body.get("questionId").toString());
        UUID selectedOptionId = body.get("selectedOptionId") != null && !body.get("selectedOptionId").toString().isBlank()
                ? UUID.fromString(body.get("selectedOptionId").toString()) : null;
        Integer timeSpent = body.get("timeSpentSeconds") != null ? ((Number) body.get("timeSpentSeconds")).intValue() : 30;
        return ResponseEntity.ok(ApiResponse.ok(dailyChallengeService.submitSprintQuestion(studentId, questionId, selectedOptionId, timeSpent)));
    }

    @PostMapping("/claim-bonus")
    public ResponseEntity<ApiResponse<Map<String, Object>>> claimBonus(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        UUID studentId = extractUserId(auth);
        String sessionType = (String) body.getOrDefault("sessionType", "DAILY_SPRINT");
        Number scoreNum = (Number) body.getOrDefault("scorePercentage", 0);
        return ResponseEntity.ok(ApiResponse.ok(dailyChallengeService.claimSprintBonus(studentId, sessionType, scoreNum.doubleValue())));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<DailyChallenge>> complete(Authentication auth, @PathVariable UUID id, @RequestBody Map<String, Object> body) {
        UUID studentId = extractUserId(auth);
        boolean correct = (Boolean) body.getOrDefault("correct", false);
        Integer timeSpent = body.get("timeSpentSeconds") != null ? ((Number) body.get("timeSpentSeconds")).intValue() : null;
        return ResponseEntity.ok(ApiResponse.ok(dailyChallengeService.completeChallenge(studentId, id, correct, timeSpent)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<DailyChallenge>>> getHistory(Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(dailyChallengeService.getHistory(studentId)));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}

