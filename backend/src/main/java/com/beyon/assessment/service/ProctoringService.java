package com.beyon.assessment.service;

import com.beyon.assessment.model.*;
import com.beyon.assessment.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProctoringService {

    private final ProctoringEventRepository eventRepository;
    private final AssessmentSessionRepository sessionRepository;
    private final AuditEventRepository auditEventRepository;
    private final AssessmentPolicyRepository policyRepository;

    public ProctoringService(
            ProctoringEventRepository eventRepository,
            AssessmentSessionRepository sessionRepository,
            AuditEventRepository auditEventRepository,
            AssessmentPolicyRepository policyRepository) {
        this.eventRepository = eventRepository;
        this.sessionRepository = sessionRepository;
        this.auditEventRepository = auditEventRepository;
        this.policyRepository = policyRepository;
    }

    public ProctoringEvent reportEvent(UUID sessionId, String eventType, String severity, String title, String description, String metadata, java.math.BigDecimal confidence) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        ProctoringEvent event = new ProctoringEvent();
        event.setSessionId(sessionId);
        event.setEventType(eventType);
        event.setSeverity(severity);
        event.setTitle(title);
        event.setDescription(description);
        event.setMetadata(metadata);
        event.setConfidence(confidence);

        ProctoringEvent saved = eventRepository.save(event);

        updateSessionCounters(session, eventType, severity);
        evaluatePolicy(session);

        return saved;
    }

    public ProctoringEvent reportFocusLost(UUID sessionId) {
        return reportEvent(sessionId, "FOCUS_LOST", "WARNING", "Window focus lost", "Candidate switched away from assessment window", null, new java.math.BigDecimal("1.00"));
    }

    public ProctoringEvent reportFullscreenExit(UUID sessionId) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setFullscreenExitCount(session.getFullscreenExitCount() + 1);
        session.setUpdatedAt(OffsetDateTime.now());
        sessionRepository.save(session);

        return reportEvent(sessionId, "FULLSCREEN_EXIT", "WARNING", "Fullscreen exited", "Candidate exited fullscreen mode", null, new java.math.BigDecimal("1.00"));
    }

    public ProctoringEvent reportFaceNotDetected(UUID sessionId) {
        return reportEvent(sessionId, "FACE_NOT_DETECTED", "WARNING", "Face not visible", "No face detected in camera feed", null, new java.math.BigDecimal("0.85"));
    }

    public ProctoringEvent reportMultipleFaces(UUID sessionId, Integer faceCount) {
        return reportEvent(sessionId, "MULTIPLE_FACES", "CRITICAL", "Multiple faces detected", faceCount + " faces detected in camera feed", "{\"faceCount\":" + faceCount + "}", new java.math.BigDecimal("0.90"));
    }

    public ProctoringEvent reportCameraDisconnected(UUID sessionId) {
        return reportEvent(sessionId, "CAMERA_DISCONNECTED", "WARNING", "Camera disconnected", "Camera feed interrupted", null, new java.math.BigDecimal("1.00"));
    }

    public ProctoringEvent reportScreenCaptureStopped(UUID sessionId) {
        return reportEvent(sessionId, "SCREEN_CAPTURE_STOPPED", "CRITICAL", "Screen capture stopped", "Screen monitoring was interrupted", null, new java.math.BigDecimal("1.00"));
    }

    public ProctoringEvent reportSuspiciousActivity(UUID sessionId, String description) {
        return reportEvent(sessionId, "SUSPICIOUS_ACTIVITY", "CRITICAL", "Suspicious activity", description, null, new java.math.BigDecimal("0.75"));
    }

    public ProctoringEvent reportConnectionLost(UUID sessionId) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setConnectionLostCount(session.getConnectionLostCount() + 1);
        session.setUpdatedAt(OffsetDateTime.now());
        sessionRepository.save(session);

        return reportEvent(sessionId, "CONNECTION_LOST", "INFO", "Connection lost", "Network connection was interrupted", null, new java.math.BigDecimal("1.00"));
    }

    public void reportHeartbeat(UUID sessionId) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setLastHeartbeatAt(OffsetDateTime.now());
        session.setUpdatedAt(OffsetDateTime.now());
        sessionRepository.save(session);
    }

    public List<Map<String, Object>> getEventsForSession(UUID sessionId) {
        List<ProctoringEvent> events = eventRepository.findBySessionIdOrderByTimestampDesc(sessionId);
        return events.stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", e.getId());
            map.put("eventType", e.getEventType());
            map.put("severity", e.getSeverity());
            map.put("title", e.getTitle());
            map.put("description", e.getDescription());
            map.put("timestamp", e.getTimestamp());
            map.put("confidence", e.getConfidence());
            map.put("metadata", e.getMetadata());
            return map;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getProctoringReport(UUID sessionId) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        Map<String, Object> report = new HashMap<>();
        report.put("sessionId", sessionId);
        report.put("integrityStatus", session.getIntegrityStatus());
        report.put("warningCount", session.getWarningCount());
        report.put("criticalEventCount", session.getCriticalEventCount());
        report.put("fullscreenExitCount", session.getFullscreenExitCount());
        report.put("windowFocusLostCount", session.getWindowFocusLostCount());
        report.put("connectionLostCount", session.getConnectionLostCount());

        List<Object[]> typeCounts = eventRepository.countByEventTypeForSession(sessionId);
        Map<String, Long> eventBreakdown = new LinkedHashMap<>();
        typeCounts.forEach(row -> eventBreakdown.put((String) row[0], (Long) row[1]));
        report.put("eventBreakdown", eventBreakdown);

        List<ProctoringEvent> recentEvents = eventRepository.findBySessionIdOrderByTimestampDesc(sessionId);
        report.put("events", recentEvents.stream().limit(50).map(e -> {
            Map<String, Object> eventMap = new HashMap<>();
            eventMap.put("eventType", e.getEventType());
            eventMap.put("severity", e.getSeverity());
            eventMap.put("title", e.getTitle());
            eventMap.put("description", e.getDescription());
            eventMap.put("timestamp", e.getTimestamp());
            eventMap.put("confidence", e.getConfidence());
            return eventMap;
        }).collect(Collectors.toList()));

        String recommendation = "APPROVE";
        if ("COMPROMISED".equals(session.getIntegrityStatus()) || "REVIEW_REQUIRED".equals(session.getIntegrityStatus())) {
            recommendation = "REVIEW";
        } else if ("FLAGGED".equals(session.getIntegrityStatus())) {
            recommendation = "MANUAL_REVIEW";
        }
        report.put("recommendation", recommendation);

        return report;
    }

    private void updateSessionCounters(AssessmentSession session, String eventType, String severity) {
        if ("WARNING".equals(severity)) {
            session.setWarningCount(session.getWarningCount() + 1);
        } else if ("CRITICAL".equals(severity)) {
            session.setCriticalEventCount(session.getCriticalEventCount() + 1);
        }
        session.setUpdatedAt(OffsetDateTime.now());
        sessionRepository.save(session);
    }

    private void evaluatePolicy(AssessmentSession session) {
        if (session.getPolicyId() == null) return;

        Optional<AssessmentPolicy> policyOpt = policyRepository.findById(session.getPolicyId());
        if (policyOpt.isEmpty()) return;

        AssessmentPolicy policy = policyOpt.get();

        if (policy.getCriticalViolationTerminate() && session.getCriticalEventCount() > 0) {
            session.setIntegrityStatus("COMPROMISED");
            session.setStatus("TERMINATED");
            session.setCompletedAt(OffsetDateTime.now());
            session.setUpdatedAt(OffsetDateTime.now());
            sessionRepository.save(session);
            return;
        }

        if (session.getWarningCount() >= policy.getMaxWarningsBeforeTerminate()) {
            session.setIntegrityStatus("COMPROMISED");
            session.setStatus("TERMINATED");
            session.setCompletedAt(OffsetDateTime.now());
            session.setUpdatedAt(OffsetDateTime.now());
            sessionRepository.save(session);
        } else if (session.getWarningCount() >= policy.getMaxWarningsBeforeFlag()) {
            session.setIntegrityStatus("FLAGGED");
            session.setUpdatedAt(OffsetDateTime.now());
            sessionRepository.save(session);
        }
    }
}
