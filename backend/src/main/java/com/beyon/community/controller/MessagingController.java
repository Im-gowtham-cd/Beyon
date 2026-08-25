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

    @PostMapping("/conversations")
    public ResponseEntity<?> startConversation(@RequestBody Map<String, String> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        UUID recipientId = UUID.fromString(body.get("recipientId"));
        return ResponseEntity.ok(messagingService.startConversation(userId, recipientId, body.get("message")));
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(HttpServletRequest request) {
        return ResponseEntity.ok(messagingService.getMyConversations(extractUserId(request)));
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<?> getMessages(@PathVariable UUID conversationId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(messagingService.getMessages(conversationId, page, size));
    }

    @PostMapping("/conversations/{conversationId}")
    public ResponseEntity<?> sendMessage(@PathVariable UUID conversationId, @RequestBody Map<String, String> body, HttpServletRequest request) {
        return ResponseEntity.ok(messagingService.sendMessage(conversationId, extractUserId(request), body.get("content")));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
