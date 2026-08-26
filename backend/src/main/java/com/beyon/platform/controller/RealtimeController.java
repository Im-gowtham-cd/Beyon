package com.beyon.platform.controller;

import com.beyon.platform.service.RealtimeService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/api/v1/realtime")
public class RealtimeController {

    private final RealtimeService realtimeService;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    public RealtimeController(RealtimeService realtimeService) {
        this.realtimeService = realtimeService;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        SseEmitter emitter = new SseEmitter(0L);

        realtimeService.subscribe(userId, event -> {
            try {
                emitter.send(SseEmitter.event().data(event, MediaType.APPLICATION_JSON));
            } catch (Exception e) {
                emitter.complete();
                realtimeService.unsubscribe(userId, event1 -> {});
            }
        });

        emitter.onCompletion(() -> realtimeService.unsubscribe(userId, event -> {}));
        emitter.onTimeout(() -> realtimeService.unsubscribe(userId, event -> {}));
        emitter.onError(e -> realtimeService.unsubscribe(userId, event -> {}));

        return emitter;
    }

    @GetMapping("/unread")
    public ResponseEntity<?> getUnread(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(Map.of(
            "events", realtimeService.getUnreadEvents(userId),
            "count", realtimeService.getUnreadCount(userId)
        ));
    }

    @PostMapping("/read/{eventId}")
    public ResponseEntity<?> markRead(@PathVariable UUID eventId) {
        realtimeService.markAsRead(eventId);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllRead(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        realtimeService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }
}
