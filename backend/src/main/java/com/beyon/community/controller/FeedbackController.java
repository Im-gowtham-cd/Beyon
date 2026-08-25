package com.beyon.community.controller;

import com.beyon.community.service.FeedbackService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/feedback")
public class FeedbackController {
    private final FeedbackService feedbackService;
    private final JwtUtil jwtUtil;

    public FeedbackController(FeedbackService feedbackService, JwtUtil jwtUtil) {
        this.feedbackService = feedbackService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, String> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(feedbackService.submit(userId,
            body.get("feedbackType"), body.get("title"), body.get("description"),
            body.get("module"), body.get("severity")));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyFeedback(HttpServletRequest request) {
        return ResponseEntity.ok(feedbackService.getMyFeedback(extractUserId(request)));
    }

    @GetMapping("/open")
    public ResponseEntity<?> getOpenFeedback() {
        return ResponseEntity.ok(feedbackService.getAllOpen());
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
