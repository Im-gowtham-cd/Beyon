package com.beyon.intelligence.controller;

import com.beyon.identity.security.JwtUtil;
import com.beyon.intelligence.service.PersonalizedFeedService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/feed")
public class PersonalizedFeedController {

    private final PersonalizedFeedService feedService;
    private final JwtUtil jwtUtil;

    public PersonalizedFeedController(PersonalizedFeedService feedService, JwtUtil jwtUtil) {
        this.feedService = feedService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<?> getFeed(HttpServletRequest request) {
        return ResponseEntity.ok(feedService.getFeed(extractUserId(request)));
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateFeed(HttpServletRequest request) {
        feedService.generateFeed(extractUserId(request));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{itemId}/dismiss")
    public ResponseEntity<?> dismissItem(@PathVariable UUID itemId, HttpServletRequest request) {
        feedService.dismissItem(extractUserId(request), itemId);
        return ResponseEntity.ok().build();
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
