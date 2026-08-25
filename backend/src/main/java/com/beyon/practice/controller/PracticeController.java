package com.beyon.practice.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.practice.model.Question;
import com.beyon.practice.model.StudentPracticeStats;
import com.beyon.practice.model.StudentQuestionAttempt;
import com.beyon.practice.service.PracticeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/practice")
public class PracticeController {

    private final PracticeService practiceService;

    public PracticeController(PracticeService practiceService) {
        this.practiceService = practiceService;
    }

    @GetMapping("/questions")
    public ResponseEntity<ApiResponse<List<Question>>> getQuestions(
            @RequestParam(required = false) UUID skillId,
            @RequestParam(required = false) UUID topicId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(practiceService.getQuestions(skillId, topicId, difficulty, page, size)));
    }

    @GetMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<Question>> getQuestion(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(practiceService.getQuestion(id)));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<StudentQuestionAttempt>> submit(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        UUID studentId = extractUserId(auth);
        UUID questionId = UUID.fromString((String) body.get("questionId"));
        String answer = (String) body.get("answer");
        Integer timeSpent = body.get("timeSpentSeconds") != null ? ((Number) body.get("timeSpentSeconds")).intValue() : null;
        return ResponseEntity.ok(ApiResponse.ok(practiceService.submitAnswer(studentId, questionId, answer, timeSpent)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<StudentPracticeStats>> getStats(Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(practiceService.getStats(studentId)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<StudentQuestionAttempt>>> getHistory(Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(practiceService.getAttemptHistory(studentId)));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
