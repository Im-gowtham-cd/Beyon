package com.beyon.modules.telemetry.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUtil;
import com.beyon.modules.telemetry.service.TelemetryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/telemetry")
public class TelemetryController {

    private final TelemetryService telemetryService;
    private final JwtUtil jwtUtil;

    public TelemetryController(TelemetryService telemetryService, JwtUtil jwtUtil) {
        this.telemetryService = telemetryService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/activity")
    public ResponseEntity<?> logActivity(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        String actionType = (String) body.getOrDefault("actionType", "GENERIC_VIEW");
        String topicOrSkillId = (String) body.getOrDefault("topicOrSkillId", "");
        int durationSeconds = body.get("durationSeconds") instanceof Number
                ? ((Number) body.get("durationSeconds")).intValue() : 0;
        @SuppressWarnings("unchecked")
        Map<String, Object> metadata = (Map<String, Object>) body.get("metadata");

        telemetryService.logActivity(userId.toString(), actionType, topicOrSkillId, durationSeconds, metadata);
        return ResponseEntity.ok(ApiResponse.ok(null, "Activity logged"));
    }

    @PostMapping("/feedback")
    public ResponseEntity<?> logFeedback(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        String recId = (String) body.getOrDefault("recommendationId", "");
        String skillName = (String) body.getOrDefault("skillName", "");
        String recType = (String) body.getOrDefault("recommendationType", "COURSE");
        String feedbackAction = (String) body.getOrDefault("feedbackAction", "CLICKED");

        telemetryService.logFeedback(userId.toString(), recId, skillName, recType, feedbackAction);
        return ResponseEntity.ok(ApiResponse.ok(null, "Feedback recorded"));
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecentActivity(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(ApiResponse.ok(telemetryService.getRecentActivity(userId.toString())));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            return jwtUtil.getUserId(auth.substring(7));
        }
        throw new RuntimeException("Unauthorized");
    }
}
