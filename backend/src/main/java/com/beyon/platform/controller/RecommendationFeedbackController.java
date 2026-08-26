package com.beyon.platform.controller;

import com.beyon.platform.service.RecommendationFeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rec-feedback")
public class RecommendationFeedbackController {

    private final RecommendationFeedbackService feedbackService;

    public RecommendationFeedbackController(RecommendationFeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/signal")
    public ResponseEntity<?> trackSignal(Authentication auth, @RequestBody Map<String, Object> body) {
        UUID userId = UUID.fromString(auth.getName());
        feedbackService.trackSignal(
            userId,
            (String) body.get("recommendationType"),
            body.get("recommendationId") != null ? UUID.fromString((String) body.get("recommendationId")) : null,
            (String) body.get("signal"),
            (String) body.get("metadata")
        );
        return ResponseEntity.ok(Map.of("message", "Signal recorded"));
    }

    @GetMapping("/signals/{recType}")
    public ResponseEntity<?> getSignalCounts(Authentication auth, @PathVariable String recType) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(feedbackService.getSignalCounts(userId, recType));
    }
}
