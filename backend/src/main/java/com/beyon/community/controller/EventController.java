package com.beyon.community.controller;

import com.beyon.community.model.*;
import com.beyon.community.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    private UUID extractUserId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(Authentication auth, @RequestBody Map<String, Object> body) {
        UUID userId = extractUserId(auth);
        Event event = eventService.createEvent(
            userId,
            (String) body.getOrDefault("organizerType", "INSTITUTION"),
            (String) body.get("title"),
            (String) body.get("description"),
            (String) body.get("eventType"),
            (String) body.get("speakerName"),
            LocalDate.parse((String) body.get("eventDate")),
            body.get("startTime") != null ? LocalTime.parse((String) body.get("startTime")) : null,
            body.get("endTime") != null ? LocalTime.parse((String) body.get("endTime")) : null,
            body.get("capacity") != null ? (Integer) body.get("capacity") : null,
            body.get("isOnline") != null ? (Boolean) body.get("isOnline") : true,
            (String) body.get("location"),
            (String) body.get("meetingLink"),
            (String) body.get("eligibilitySkills"),
            body.get("coinReward") != null ? (Integer) body.get("coinReward") : 0,
            body.get("xpReward") != null ? (Integer) body.get("xpReward") : 0,
            body.get("certificateProvided") != null ? (Boolean) body.get("certificateProvided") : false
        );
        return ResponseEntity.ok(event);
    }

    @GetMapping
    public ResponseEntity<?> getPublishedEvents() {
        return ResponseEntity.ok(eventService.getPublishedEvents());
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyEvents(Authentication auth) {
        return ResponseEntity.ok(eventService.getEventsByOrganizer(extractUserId(auth)));
    }

    @PostMapping("/{eventId}/register")
    public ResponseEntity<EventRegistration> register(Authentication auth, @PathVariable UUID eventId) {
        return ResponseEntity.ok(eventService.registerForEvent(eventId, extractUserId(auth)));
    }

    @GetMapping("/my-registrations")
    public ResponseEntity<?> getMyRegistrations(Authentication auth) {
        return ResponseEntity.ok(eventService.getMyRegistrations(extractUserId(auth)));
    }
}
