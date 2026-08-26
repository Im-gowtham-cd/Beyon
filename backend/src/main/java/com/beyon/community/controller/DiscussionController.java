package com.beyon.community.controller;

import com.beyon.community.service.DiscussionService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/discussions")
public class DiscussionController {
    private final DiscussionService discussionService;
    private final JwtUtil jwtUtil;

    public DiscussionController(DiscussionService discussionService, JwtUtil jwtUtil) {
        this.discussionService = discussionService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/threads")
    public ResponseEntity<?> createThread(@RequestBody Map<String, String> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(discussionService.createThread(userId, UUID.fromString(body.get("categoryId")), body.get("title"), body.get("content")));
    }

    @GetMapping("/threads")
    public ResponseEntity<?> getThreads(@RequestParam(required = false) UUID categoryId) {
        return ResponseEntity.ok(discussionService.getThreads(categoryId));
    }

    @GetMapping("/threads/{threadId}")
    public ResponseEntity<?> getThread(@PathVariable UUID threadId) {
        return ResponseEntity.ok(discussionService.getThread(threadId));
    }

    @PostMapping("/threads/{threadId}/replies")
    public ResponseEntity<?> addReply(@PathVariable UUID threadId, @RequestBody Map<String, String> body, HttpServletRequest request) {
        return ResponseEntity.ok(discussionService.addReply(threadId, extractUserId(request), body.get("content")));
    }

    @GetMapping("/threads/{threadId}/replies")
    public ResponseEntity<?> getReplies(@PathVariable UUID threadId) {
        return ResponseEntity.ok(discussionService.getReplies(threadId));
    }

    @PostMapping("/threads/{threadId}/solve")
    public ResponseEntity<?> markSolved(@PathVariable UUID threadId, HttpServletRequest request) {
        discussionService.markSolved(threadId, extractUserId(request));
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
