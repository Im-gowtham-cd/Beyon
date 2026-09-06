package com.beyon.assessment.controller;

import com.beyon.assessment.service.AssessmentSessionService;
import com.beyon.assessment.service.ProctoringService;
import com.beyon.identity.security.JwtUtil;
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
    private final com.beyon.practice.service.CompanyService companyService;

    public AssessmentController(AssessmentSessionService sessionService,
                                ProctoringService proctoringService,
                                JwtUtil jwtUtil,
                                com.beyon.practice.service.CompanyService companyService) {
        this.sessionService = sessionService;
        this.proctoringService = proctoringService;
        this.jwtUtil = jwtUtil;
        this.companyService = companyService;
    }

    @PostMapping("/session")
    public ResponseEntity<?> createSession(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        UUID applicationId = body.get("applicationId") != null ? UUID.fromString((String) body.get("applicationId")) : UUID.randomUUID();
        UUID opportunityId = body.get("opportunityId") != null ? UUID.fromString((String) body.get("opportunityId")) : null;
        int questionCount = body.get("questionCount") instanceof Number ? ((Number) body.get("questionCount")).intValue() : 40;
        int durationMinutes = body.get("durationMinutes") instanceof Number ? ((Number) body.get("durationMinutes")).intValue() : 60;

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

    @RequestMapping(value = "/session/{sessionId}/verify", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<?> verifyIdentity(@PathVariable UUID sessionId, @RequestBody(required = false) Map<String, Object> body) {
        String status = (body != null && body.get("status") != null) ? (String) body.get("status") : "VERIFIED";
        String captureUrl = body != null ? (String) body.get("captureUrl") : null;
        Boolean faceDetected = body != null ? (Boolean) body.get("faceDetected") : Boolean.TRUE;
        Integer faceCount = (body != null && body.get("faceCount") != null) ? (Integer) body.get("faceCount") : 1;
        java.math.BigDecimal livenessScore = (body != null && body.get("livenessScore") != null)
            ? new java.math.BigDecimal(body.get("livenessScore").toString()) : new java.math.BigDecimal("0.95");

        var session = sessionService.verifyIdentity(sessionId, status, captureUrl, faceDetected, faceCount, livenessScore);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("sessionId", session.getId());
        res.put("status", session.getStatus());
        res.put("canResume", true);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/session/{sessionId}/system-check")
    public ResponseEntity<?> recordSystemCheck(@PathVariable UUID sessionId, @RequestBody(required = false) Map<String, String> body) {
        String checkType = (body != null && body.get("checkType") != null) ? body.get("checkType") : "SYSTEM";
        String status = (body != null && body.get("status") != null) ? body.get("status") : "PASS";
        String details = (body != null && body.get("details") != null) ? body.get("details") : "{\"status\":\"ok\"}";
        if (!details.trim().startsWith("{") && !details.trim().startsWith("[")) {
            details = "{\"message\":\"" + details.replace("\"", "\\\"") + "\"}";
        }
        var result = sessionService.recordSystemCheck(sessionId, checkType, status, details);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", result.getId());
        res.put("checkType", result.getCheckType());
        res.put("status", result.getStatus());
        res.put("systemCheckCompleted", true);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/session/{sessionId}/system-check/complete")
    public ResponseEntity<?> completeSystemCheck(@PathVariable UUID sessionId) {
        var session = sessionService.completeSystemCheck(sessionId);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("sessionId", session.getId());
        res.put("status", session.getStatus());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/session/{sessionId}/start")
    public ResponseEntity<?> startAssessment(@PathVariable UUID sessionId, @RequestBody(required = false) Map<String, List<String>> body) {
        List<UUID> questionIds = new ArrayList<>();
        if (body != null && body.get("questionIds") != null) {
            for (String qId : body.get("questionIds")) {
                try {
                    questionIds.add(UUID.fromString(qId));
                } catch (Exception e) {
                    questionIds.add(UUID.nameUUIDFromBytes(qId.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
                }
            }
        }
        var session = sessionService.startAssessment(sessionId, questionIds);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("sessionId", session.getId());
        res.put("status", session.getStatus());
        res.put("startedAt", session.getStartedAt());
        res.put("expiresAt", session.getExpiresAt());
        res.put("totalQuestions", session.getTotalQuestions());
        res.put("durationMinutes", session.getDurationMinutes());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/session/{sessionId}/questions")
    public ResponseEntity<?> getSessionQuestions(@PathVariable UUID sessionId) {
        var session = sessionService.getAssessmentSession(sessionId);
        if (session != null && session.getOpportunityId() != null) {
            return ResponseEntity.ok(com.beyon.common.response.ApiResponse.ok(companyService.getOpportunityQuestions(session.getOpportunityId())));
        }
        return ResponseEntity.ok(com.beyon.common.response.ApiResponse.ok(companyService.getOpportunityQuestions(null)));
    }

    @PostMapping("/session/{sessionId}/answer")
    public ResponseEntity<?> submitAnswer(@PathVariable UUID sessionId, @RequestBody Map<String, Object> body) {
        UUID questionId;
        try {
            questionId = UUID.fromString((String) body.get("questionId"));
        } catch (Exception e) {
            questionId = UUID.nameUUIDFromBytes(((String) body.get("questionId")).getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
        UUID selectedOptionId = null;
        if (body.get("selectedOptionId") != null) {
            try {
                selectedOptionId = UUID.fromString((String) body.get("selectedOptionId"));
            } catch (Exception e) {
                selectedOptionId = UUID.nameUUIDFromBytes(((String) body.get("selectedOptionId")).getBytes(java.nio.charset.StandardCharsets.UTF_8));
            }
        }
        String answerText = (String) body.get("answerText");
        String codeAnswer = (String) body.get("codeAnswer");
        int timeSpentSeconds = body.get("timeSpentSeconds") != null ? (int) body.get("timeSpentSeconds") : 0;
        boolean markedForReview = Boolean.TRUE.equals(body.get("markedForReview"));

        var answer = sessionService.submitAnswer(sessionId, questionId, selectedOptionId, answerText, codeAnswer, timeSpentSeconds, markedForReview);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("answerId", answer.getId());
        res.put("updatedAt", answer.getUpdatedAt());
        return ResponseEntity.ok(res);
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
    public ResponseEntity<?> submitAssessment(@PathVariable UUID sessionId, @RequestBody(required = false) Map<String, Object> body) {
        var session = sessionService.submitAssessment(sessionId, body);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("sessionId", session.getId());
        res.put("status", session.getStatus());
        res.put("score", session.getScore() != null ? session.getScore() : 0);
        res.put("accuracy", session.getAccuracy() != null ? session.getAccuracy() : 0);
        res.put("questionsAttempted", session.getQuestionsAttempted());
        res.put("questionsCorrect", session.getQuestionsCorrect());
        res.put("completedAt", session.getCompletedAt());
        return ResponseEntity.ok(res);
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

