package com.beyon.practice.controller;

import com.beyon.identity.security.JwtUtil;
import com.beyon.practice.service.WeeklyTestService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/weekly-tests")
public class WeeklyTestController {

    private final WeeklyTestService testService;
    private final JwtUtil jwtUtil;

    public WeeklyTestController(WeeklyTestService testService, JwtUtil jwtUtil) {
        this.testService = testService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<?> getRecentTests() {
        return ResponseEntity.ok(testService.getRecentTests());
    }

    @GetMapping("/{testId}")
    public ResponseEntity<?> getTest(@PathVariable UUID testId) {
        return ResponseEntity.ok(testService.getTest(testId));
    }

    @PostMapping("/{testId}/start")
    public ResponseEntity<?> startTest(@PathVariable UUID testId, HttpServletRequest request) {
        return ResponseEntity.ok(testService.startTest(extractUserId(request), testId));
    }

    @PostMapping("/{testId}/submit")
    public ResponseEntity<?> submitTest(@PathVariable UUID testId, @RequestBody Map<String, Object> body, HttpServletRequest request) {
        int correctAnswers = (Integer) body.get("correctAnswers");
        int timeTaken = (Integer) body.get("timeTakenSeconds");
        return ResponseEntity.ok(testService.submitTest(extractUserId(request), testId, correctAnswers, timeTaken));
    }

    @GetMapping("/{testId}/leaderboard")
    public ResponseEntity<?> getLeaderboard(@PathVariable UUID testId) {
        return ResponseEntity.ok(testService.getLeaderboard(testId));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getMyHistory(HttpServletRequest request) {
        return ResponseEntity.ok(testService.getStudentHistory(extractUserId(request)));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
