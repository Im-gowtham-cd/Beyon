package com.beyon.assessment.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.assessment.service.AssessmentBuilderService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/v1/assessment-builder")
public class AssessmentBuilderController {
    private final AssessmentBuilderService builderService;
    private final JwtUtil jwtUtil;

    public AssessmentBuilderController(AssessmentBuilderService builderService, JwtUtil jwtUtil) {
        this.builderService = builderService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/assessments")
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(ApiResponse.ok(builderService.create(userId,
            (String) body.get("title"), (String) body.get("description"),
            body.get("durationMinutes") != null ? (Integer) body.get("durationMinutes") : null,
            body.get("totalQuestions") != null ? (Integer) body.get("totalQuestions") : null,
            parseBigDecimal(body.get("passingScore")),
            body.get("negativeMarking") != null ? (Boolean) body.get("negativeMarking") : null,
            parseBigDecimal(body.get("negativeMarks")),
            body.get("attemptLimit") != null ? (Integer) body.get("attemptLimit") : null,
            body.get("coinCost") != null ? (Integer) body.get("coinCost") : null,
            body.get("adaptiveEnabled") != null ? (Boolean) body.get("adaptiveEnabled") : null)));
    }

    @GetMapping("/assessments")
    public ResponseEntity<?> getMyAssessments(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(builderService.getByCompany(extractUserId(request))));
    }

    @GetMapping("/assessments/{id}")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(builderService.getById(id)));
    }

    @PatchMapping("/assessments/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok(builderService.update(id, body)));
    }

    @PostMapping("/assessments/{id}/publish")
    public ResponseEntity<?> publish(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(builderService.publish(id)));
    }

    @PostMapping("/assessments/{id}/unpublish")
    public ResponseEntity<?> unpublish(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(builderService.unpublish(id)));
    }

    @PostMapping("/questions")
    public ResponseEntity<?> createQuestion(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        UUID skillId = parseUuid(body.get("skillId"));
        BigDecimal score = parseBigDecimal(body.get("score"));
        return ResponseEntity.ok(ApiResponse.ok(builderService.createQuestion(userId, "COMPANY",
            (String) body.get("questionType"), (String) body.get("difficulty"),
            (String) body.get("questionText"), (String) body.get("options"),
            (String) body.get("correctAnswer"), (String) body.get("explanation"), score, skillId)));
    }

    @GetMapping("/questions")
    public ResponseEntity<?> searchQuestions(@RequestParam(required = false) String difficulty,
                                              @RequestParam(required = false) String type,
                                              @RequestParam(required = false) UUID skillId) {
        return ResponseEntity.ok(ApiResponse.ok(builderService.searchQuestions(difficulty, type, skillId)));
    }

    @GetMapping("/questions/stats")
    public ResponseEntity<?> getStats(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(builderService.getQuestionBankStats(extractUserId(request))));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }

    private BigDecimal parseBigDecimal(Object val) {
        if (val == null) return null;
        return new BigDecimal(val.toString());
    }

    private UUID parseUuid(Object val) {
        if (val == null) return null;
        return UUID.fromString(val.toString());
    }
}
