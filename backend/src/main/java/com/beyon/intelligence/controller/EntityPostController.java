package com.beyon.intelligence.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUtil;
import com.beyon.intelligence.service.EntityPostService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/entity-posts")
public class EntityPostController {
    private final EntityPostService postService;
    private final JwtUtil jwtUtil;

    public EntityPostController(EntityPostService postService, JwtUtil jwtUtil) {
        this.postService = postService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(ApiResponse.ok(postService.create(userId, body.get("entityType"),
            body.get("postType"), body.get("title"), body.get("content"), body.get("actionUrl"))));
    }

    @GetMapping("/feed")
    public ResponseEntity<?> getFeed(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(postService.getFeed(page, size)));
    }

    @GetMapping("/entity/{entityId}")
    public ResponseEntity<?> getEntityPosts(@PathVariable UUID entityId, @RequestParam String entityType) {
        return ResponseEntity.ok(ApiResponse.ok(postService.getEntityPosts(entityId, entityType)));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
