package com.beyon.assessment.controller;

import com.beyon.assessment.service.ProctoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/proctoring")
public class ProctoringController {

    private final ProctoringService proctoringService;

    public ProctoringController(ProctoringService proctoringService) {
        this.proctoringService = proctoringService;
    }

    @PostMapping("/event")
    public ResponseEntity<?> reportEvent(@RequestBody Map<String, Object> body) {
        UUID sessionId = UUID.fromString((String) body.get("sessionId"));
        String eventType = (String) body.get("eventType");
        String severity = (String) body.get("severity");
        String title = (String) body.get("title");
        String description = (String) body.get("description");
        String metadata = (String) body.get("metadata");
        BigDecimal confidence = body.get("confidence") != null ? new BigDecimal(body.get("confidence").toString()) : null;

        var event = proctoringService.reportEvent(sessionId, eventType, severity, title, description, metadata, confidence);
        return ResponseEntity.ok(Map.of("eventId", event.getId(), "severity", event.getSeverity()));
    }

    @PostMapping("/event/focus-lost")
    public ResponseEntity<?> reportFocusLost(@RequestBody Map<String, String> body) {
        UUID sessionId = UUID.fromString(body.get("sessionId"));
        var event = proctoringService.reportFocusLost(sessionId);
        return ResponseEntity.ok(Map.of("eventId", event.getId()));
    }

    @PostMapping("/event/fullscreen-exit")
    public ResponseEntity<?> reportFullscreenExit(@RequestBody Map<String, String> body) {
        UUID sessionId = UUID.fromString(body.get("sessionId"));
        var event = proctoringService.reportFullscreenExit(sessionId);
        return ResponseEntity.ok(Map.of("eventId", event.getId()));
    }

    @PostMapping("/event/face-not-detected")
    public ResponseEntity<?> reportFaceNotDetected(@RequestBody Map<String, String> body) {
        UUID sessionId = UUID.fromString(body.get("sessionId"));
        var event = proctoringService.reportFaceNotDetected(sessionId);
        return ResponseEntity.ok(Map.of("eventId", event.getId()));
    }

    @PostMapping("/event/multiple-faces")
    public ResponseEntity<?> reportMultipleFaces(@RequestBody Map<String, Object> body) {
        UUID sessionId = UUID.fromString((String) body.get("sessionId"));
        Integer faceCount = (Integer) body.getOrDefault("faceCount", 2);
        var event = proctoringService.reportMultipleFaces(sessionId, faceCount);
        return ResponseEntity.ok(Map.of("eventId", event.getId()));
    }

    @PostMapping("/event/camera-disconnected")
    public ResponseEntity<?> reportCameraDisconnected(@RequestBody Map<String, String> body) {
        UUID sessionId = UUID.fromString(body.get("sessionId"));
        var event = proctoringService.reportCameraDisconnected(sessionId);
        return ResponseEntity.ok(Map.of("eventId", event.getId()));
    }

    @PostMapping("/event/screen-capture-stopped")
    public ResponseEntity<?> reportScreenCaptureStopped(@RequestBody Map<String, String> body) {
        UUID sessionId = UUID.fromString(body.get("sessionId"));
        var event = proctoringService.reportScreenCaptureStopped(sessionId);
        return ResponseEntity.ok(Map.of("eventId", event.getId()));
    }

    @PostMapping("/event/suspicious")
    public ResponseEntity<?> reportSuspiciousActivity(@RequestBody Map<String, String> body) {
        UUID sessionId = UUID.fromString(body.get("sessionId"));
        String description = body.get("description");
        var event = proctoringService.reportSuspiciousActivity(sessionId, description);
        return ResponseEntity.ok(Map.of("eventId", event.getId()));
    }

    @PostMapping("/event/connection-lost")
    public ResponseEntity<?> reportConnectionLost(@RequestBody Map<String, String> body) {
        UUID sessionId = UUID.fromString(body.get("sessionId"));
        var event = proctoringService.reportConnectionLost(sessionId);
        return ResponseEntity.ok(Map.of("eventId", event.getId()));
    }

    @GetMapping("/session/{sessionId}/events")
    public ResponseEntity<?> getEvents(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(proctoringService.getEventsForSession(sessionId));
    }

    @GetMapping("/session/{sessionId}/report")
    public ResponseEntity<?> getReport(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(proctoringService.getProctoringReport(sessionId));
    }
}
