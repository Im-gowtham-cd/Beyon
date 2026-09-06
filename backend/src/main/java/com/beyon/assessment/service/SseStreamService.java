package com.beyon.assessment.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manages SSE (Server-Sent Events) connections for DualView proctoring.
 * Desktop and web recruiter dashboards subscribe to session events.
 */
@Service
public class SseStreamService {

    private final ConcurrentHashMap<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String procSessionId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        emitter.onCompletion(() -> emitters.remove(procSessionId));
        emitter.onTimeout(() -> emitters.remove(procSessionId));
        emitter.onError((e) -> emitters.remove(procSessionId));

        // Replace existing connection
        SseEmitter existing = emitters.put(procSessionId, emitter);
        if (existing != null) {
            existing.complete();
        }

        // Send initial heartbeat
        push(procSessionId, "CONNECTED", Map.of("procSessionId", procSessionId));
        return emitter;
    }

    public void pushMobileConnected(String procSessionId) {
        push(procSessionId, "MOBILE_CONNECTED", Map.of(
            "procSessionId", procSessionId,
            "timestamp", System.currentTimeMillis()
        ));
    }

    public void pushMobileDisconnected(String procSessionId) {
        push(procSessionId, "MOBILE_DISCONNECTED", Map.of(
            "procSessionId", procSessionId,
            "timestamp", System.currentTimeMillis()
        ));
    }

    public void pushCameraActive(String procSessionId, String deviceType, boolean active) {
        push(procSessionId, active ? "CAMERA_ACTIVE" : "CAMERA_INACTIVE", Map.of(
            "procSessionId", procSessionId,
            "deviceType", deviceType,
            "timestamp", System.currentTimeMillis()
        ));
    }

    public void pushRiskLevelChanged(String procSessionId, int score, String level) {
        push(procSessionId, "RISK_LEVEL_CHANGED", Map.of(
            "procSessionId", procSessionId,
            "score", score,
            "level", level,
            "timestamp", System.currentTimeMillis()
        ));
    }

    public void pushIncidentCreated(String procSessionId, String incidentId, String incidentType, String severity, double confidence) {
        push(procSessionId, "INCIDENT_CREATED", Map.of(
            "procSessionId", procSessionId,
            "incidentId", incidentId,
            "incidentType", incidentType,
            "severity", severity,
            "confidence", confidence,
            "timestamp", System.currentTimeMillis()
        ));
    }

    public void pushProctoringWarning(String procSessionId, String message) {
        push(procSessionId, "PROCTORING_WARNING", Map.of(
            "procSessionId", procSessionId,
            "message", message,
            "timestamp", System.currentTimeMillis()
        ));
    }

    private void push(String procSessionId, String eventType, Object data) {
        SseEmitter emitter = emitters.get(procSessionId);
        if (emitter == null) return;
        try {
            emitter.send(SseEmitter.event()
                .name(eventType)
                .data(data));
        } catch (IOException e) {
            emitters.remove(procSessionId);
            emitter.completeWithError(e);
        }
    }

    public boolean isConnected(String procSessionId) {
        return emitters.containsKey(procSessionId);
    }
}
