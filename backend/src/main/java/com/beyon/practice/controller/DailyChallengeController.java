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
