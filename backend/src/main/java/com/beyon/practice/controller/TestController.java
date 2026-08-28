package com.beyon.practice.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.practice.model.Test;
import com.beyon.practice.model.TestAttempt;
import com.beyon.practice.repository.TestAttemptRepository;
import com.beyon.practice.repository.TestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tests")
public class TestController {

    private final TestRepository testRepository;
    private final TestAttemptRepository attemptRepository;

    public TestController(TestRepository testRepository, TestAttemptRepository attemptRepository) {
        this.testRepository = testRepository;
        this.attemptRepository = attemptRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Test>>> getTests(
            @RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(ApiResponse.ok(testRepository.findByStatus(status)));
        }
        return ResponseEntity.ok(ApiResponse.ok(testRepository.findAllByOrderByCreatedAtDesc()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Test>> getTest(@PathVariable UUID id) {
        return testRepository.findById(id)
                .map(t -> ResponseEntity.ok(ApiResponse.ok(t)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-attempts")
    public ResponseEntity<ApiResponse<List<TestAttempt>>> getMyAttempts(Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(attemptRepository.findByStudentIdOrderByStartedAtDesc(studentId)));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<ApiResponse<TestAttempt>> startTest(Authentication auth, @PathVariable UUID id) {
        UUID studentId = extractUserId(auth);
        Test test = testRepository.findById(id).orElseThrow(() -> new RuntimeException("Test not found"));

        TestAttempt attempt = attemptRepository.findByStudentIdAndTestId(studentId, id)
                .orElseGet(() -> {
                    TestAttempt a = new TestAttempt();
                    a.setStudentId(studentId);
                    a.setTestId(id);
                    a.setStatus("IN_PROGRESS");
                    return a;
                });

        attempt.setStartedAt(Instant.now());
        attempt.setStatus("IN_PROGRESS");
        return ResponseEntity.ok(ApiResponse.ok(attemptRepository.save(attempt)));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<TestAttempt>> submitTest(
            Authentication auth,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        UUID studentId = extractUserId(auth);
        TestAttempt attempt = attemptRepository.findByStudentIdAndTestId(studentId, id)
                .orElseGet(() -> {
                    TestAttempt a = new TestAttempt();
                    a.setStudentId(studentId);
                    a.setTestId(id);
                    return a;
                });

        Number scoreNum = (Number) body.getOrDefault("score", 75);
        int timeSpent = body.get("timeSpentSeconds") != null ? ((Number) body.get("timeSpentSeconds")).intValue() : 1800;

        attempt.setScore(new BigDecimal(scoreNum.toString()));
        attempt.setSubmittedAt(Instant.now());
        attempt.setTimeSpentSeconds(timeSpent);
        attempt.setStatus("COMPLETED");
        attempt.setAccuracy(new BigDecimal(scoreNum.toString()));
        return ResponseEntity.ok(ApiResponse.ok(attemptRepository.save(attempt)));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
