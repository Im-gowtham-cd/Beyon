package com.beyon.assessment.controller;

import com.beyon.assessment.service.AssessmentSessionService;
import com.beyon.assessment.service.ProctoringService;
import com.beyon.identity.security.JwtUtil;
import com.beyon.identity.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/assessment")
public class AssessmentController {

    private final AssessmentSessionService sessionService;
    private final ProctoringService proctoringService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public AssessmentController(AssessmentSessionService sessionService, ProctoringService proctoringService, JwtUtil jwtUtil, UserRepository userRepository) {
        this.sessionService = sessionService;
        this.proctoringService = proctoringService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @PostMapping("/session")
    public ResponseEntity<?> createSession(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        UUID applicationId = UUID.fromString((String) body.get("applicationId"));
        UUID opportunityId = UUID.fromString((String) body.get("opportunityId"));
        int questionCount = (int) body.getOrDefault("questionCount", 40);
        int durationMinutes = (int) body.getOrDefault("durationMinutes", 60);

        var session = sessionService.createSession(applicationId, userId, opportunityId, questionCount, durationMinutes);
        return ResponseEntity.ok(Map.of(
            "sessionId", session.getId(),
            "sessionToken", session.getSessionToken(),
            "launchToken", session.getLaunchToken(),
            "status", session.getStatus(),
            "totalQuestions", session.getTotalQuestions(),
            "durationMinutes", session.getDurationMinutes()
        ));
    }

    @PostMapping("/session/{sessionId}/launch-token")
    public ResponseEntity<?> generateLaunchToken(@PathVariable UUID sessionId, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        String token = sessionService.generateLaunchToken(sessionId, userId);
        return ResponseEntity.ok(Map.of("launchToken", token));
    }

    @PostMapping("/launch")
    public ResponseEntity<?> launchSession(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String launchToken = body.get("launchToken");
        String deviceFingerprint = body.get("deviceFingerprint");
        String deviceInfo = body.get("deviceInfo");
        String ip = request.getRemoteAddr();

        var session = sessionService.launchSession(launchToken, deviceFingerprint, deviceInfo, ip);
        return ResponseEntity.ok(Map.of(
            "sessionId", session.getId(),
            "status", session.getStatus(),
            "totalQuestions", session.getTotalQuestions(),
            "durationMinutes", session.getDurationMinutes(),
            "expiresAt", session.getExpiresAt()
        ));
    }

    @PostMapping("/session/{sessionId}/verify")
    public ResponseEntity<?> verifyIdentity(@PathVariable UUID sessionId, @RequestBody Map<String, Object> body) {
        String status = (String) body.get("status");
        String captureUrl = (String) body.get("captureUrl");
        Boolean faceDetected = (Boolean) body.get("faceDetected");
        Integer faceCount = body.get("faceCount") != null ? (Integer) body.get("faceCount") : 0;
        java.math.BigDecimal livenessScore = body.get("livenessScore") != null
            ? new java.math.BigDecimal(body.get("livenessScore").toString()) : null;

        var session = sessionService.verifyIdentity(sessionId, status, captureUrl, faceDetected, faceCount, livenessScore);
        return ResponseEntity.ok(Map.of("sessionId", session.getId(), "status", session.getStatus()));
    }

    @PostMapping("/session/{sessionId}/system-check")
    public ResponseEntity<?> recordSystemCheck(@PathVariable UUID sessionId, @RequestBody Map<String, String> body) {
        var result = sessionService.recordSystemCheck(sessionId, body.get("checkType"), body.get("status"), body.get("details"));
        return ResponseEntity.ok(Map.of("id", result.getId(), "checkType", result.getCheckType(), "status", result.getStatus()));
    }

    @PostMapping("/session/{sessionId}/system-check/complete")
    public ResponseEntity<?> completeSystemCheck(@PathVariable UUID sessionId) {
        var session = sessionService.completeSystemCheck(sessionId);
        return ResponseEntity.ok(Map.of("sessionId", session.getId(), "status", session.getStatus()));
    }

    @PostMapping("/session/{sessionId}/start")
    public ResponseEntity<?> startAssessment(@PathVariable UUID sessionId, @RequestBody Map<String, List<String>> body) {
        List<UUID> questionIds = body.get("questionIds").stream().map(UUID::fromString).toList();
        var session = sessionService.startAssessment(sessionId, questionIds);
        return ResponseEntity.ok(Map.of(
            "sessionId", session.getId(),
            "status", session.getStatus(),
            "startedAt", session.getStartedAt(),
            "expiresAt", session.getExpiresAt()
        ));
    }

    @PostMapping("/session/{sessionId}/answer")
    public ResponseEntity<?> submitAnswer(@PathVariable UUID sessionId, @RequestBody Map<String, Object> body) {
        UUID questionId = UUID.fromString((String) body.get("questionId"));
        UUID selectedOptionId = body.get("selectedOptionId") != null ? UUID.fromString((String) body.get("selectedOptionId")) : null;
        String answerText = (String) body.get("answerText");
        String codeAnswer = (String) body.get("codeAnswer");
        int timeSpentSeconds = body.get("timeSpentSeconds") != null ? (int) body.get("timeSpentSeconds") : 0;
        boolean markedForReview = Boolean.TRUE.equals(body.get("markedForReview"));

        var answer = sessionService.submitAnswer(sessionId, questionId, selectedOptionId, answerText, codeAnswer, timeSpentSeconds, markedForReview);
        return ResponseEntity.ok(Map.of("answerId", answer.getId(), "updatedAt", answer.getUpdatedAt()));
    }

    @GetMapping("/session/{sessionId}/time")
    public ResponseEntity<?> getRemainingTime(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(sessionService.getRemainingTime(sessionId));
    }

    @PostMapping("/session/{sessionId}/heartbeat")
    public ResponseEntity<?> heartbeat(@PathVariable UUID sessionId) {
        sessionService.updateHeartbeat(sessionId);
        proctoringService.reportHeartbeat(sessionId);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/session/{sessionId}/submit")
    public ResponseEntity<?> submitAssessment(@PathVariable UUID sessionId) {
        var session = sessionService.submitAssessment(sessionId);
        return ResponseEntity.ok(Map.of(
            "sessionId", session.getId(),
            "status", session.getStatus(),
            "score", session.getScore(),
            "accuracy", session.getAccuracy(),
            "questionsAttempted", session.getQuestionsAttempted(),
            "questionsCorrect", session.getQuestionsCorrect(),
            "completedAt", session.getCompletedAt()
        ));
    }

    @GetMapping("/session/{sessionId}/results")
    public ResponseEntity<?> getResults(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(sessionService.getSessionResults(sessionId));
    }

    @GetMapping("/session/{sessionId}/results/company")
    public ResponseEntity<?> getCompanyResults(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(sessionService.getCompanyResults(sessionId));
    }

    @PostMapping("/session/{sessionId}/terminate")
    public ResponseEntity<?> terminateSession(@PathVariable UUID sessionId, @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "Manual termination");
        var session = sessionService.terminateSession(sessionId, reason);
        return ResponseEntity.ok(Map.of("sessionId", session.getId(), "status", session.getStatus()));
    }

    @GetMapping("/my-sessions")
    public ResponseEntity<?> getMySessions(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        var sessions = sessionService.getActiveSessions();
        return ResponseEntity.ok(sessions);
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            return jwtUtil.getUserId(token);
        }
        throw new RuntimeException("Unauthorized");
    }
}
