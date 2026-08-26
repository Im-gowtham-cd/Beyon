package com.beyon.platform.controller;

import com.beyon.platform.model.ContentResource;
import com.beyon.platform.service.ContentService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/content")
public class ContentController {
    private final ContentService contentService;
    private final JwtUtil jwtUtil;

    public ContentController(ContentService contentService, JwtUtil jwtUtil) {
        this.contentService = contentService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ContentResource resource, HttpServletRequest request) {
        return ResponseEntity.ok(contentService.createResource(extractUserId(request), resource));
    }

    @GetMapping
    public ResponseEntity<?> getAll() { return ResponseEntity.ok(contentService.getPublishedResources()); }

    @GetMapping("/type/{type}")
    public ResponseEntity<?> getByType(@PathVariable String type) { return ResponseEntity.ok(contentService.getResourcesByType(type)); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable UUID id) { return ResponseEntity.ok(contentService.getResource(id)); }

    @GetMapping("/my")
    public ResponseEntity<?> getMy(HttpServletRequest request) {
        return ResponseEntity.ok(contentService.getMyResources(extractUserId(request)));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
