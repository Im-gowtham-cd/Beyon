package com.beyon.community.controller;

import com.beyon.community.service.MessagingService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/messages")
public class MessagingController {
    private final MessagingService messagingService;
    private final JwtUtil jwtUtil;

    public MessagingController(MessagingService messagingService, JwtUtil jwtUtil) {
        this.messagingService = messagingService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "50") int limit,
            HttpServletRequest request) {
        UUID currentUserId = extractUserId(request);
        return ResponseEntity.ok(Map.of("data", messagingService.getContacts(currentUserId, query, role, limit)));
    }

    @PostMapping("/conversations")
    public ResponseEntity<?> startConversation(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        String recipientIdStr = (String) body.get("recipientId");
        if (recipientIdStr == null && body.containsKey("participantIds")) {
            List<?> pIds = (List<?>) body.get("participantIds");
            if (pIds != null && !pIds.isEmpty()) {
                recipientIdStr = pIds.get(0).toString();
            }
        }
        if (recipientIdStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "recipientId or participantIds is required"));
        }

        UUID recipientId = UUID.fromString(recipientIdStr);
        String title = (String) body.get("title");
        String message = (String) body.get("message");

        Map<String, Object> conv = messagingService.startConversation(userId, recipientId, title, message);
        return ResponseEntity.ok(Map.of("data", conv));
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(Map.of("data", messagingService.getMyConversations(userId)));
    }

    @GetMapping({"/conversations/{conversationId}", "/conversations/{conversationId}/messages"})
    public ResponseEntity<?> getMessages(
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(Map.of("data", messagingService.getMessages(conversationId, userId, page, size)));
    }

    @PostMapping({"/conversations/{conversationId}", "/conversations/{conversationId}/messages"})
    public ResponseEntity<?> sendMessage(
            @PathVariable UUID conversationId,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        String content = body.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "content is required"));
        }
        return ResponseEntity.ok(Map.of("data", messagingService.sendMessage(conversationId, userId, content.trim())));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            return jwtUtil.getUserId(auth.substring(7));
        }
        throw new RuntimeException("Unauthorized");
    }
}
