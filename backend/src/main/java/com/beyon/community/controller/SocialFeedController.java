package com.beyon.community.controller;

import com.beyon.community.service.SocialFeedService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/social")
public class SocialFeedController {
    private final SocialFeedService feedService;
    private final JwtUtil jwtUtil;

    public SocialFeedController(SocialFeedService feedService, JwtUtil jwtUtil) {
        this.feedService = feedService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@RequestBody Map<String, String> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(feedService.createPost(userId, "STUDENT", body.get("postType"), body.get("title"), body.get("content")));
    }

    @GetMapping("/feed")
    public ResponseEntity<?> getFeed(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(feedService.getFeed(page, size));
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<?> getPost(@PathVariable UUID postId) { return ResponseEntity.ok(feedService.getPost(postId)); }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable UUID postId, HttpServletRequest request) {
        feedService.deletePost(postId, extractUserId(request));
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<?> addComment(@PathVariable UUID postId, @RequestBody Map<String, String> body, HttpServletRequest request) {
        return ResponseEntity.ok(feedService.addComment(postId, extractUserId(request), body.get("content")));
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<?> getComments(@PathVariable UUID postId) { return ResponseEntity.ok(feedService.getComments(postId)); }

    @PostMapping("/like")
    public ResponseEntity<?> toggleLike(@RequestBody Map<String, String> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(feedService.toggleLike(userId, body.get("targetType"), UUID.fromString(body.get("targetId"))));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
