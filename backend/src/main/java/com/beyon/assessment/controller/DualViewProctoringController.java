package com.beyon.assessment.controller;

import com.beyon.assessment.model.*;
import com.beyon.assessment.repository.*;
import com.beyon.assessment.service.*;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * DualView Proctoring REST API + SSE stream.
 *
 * All /api/v1/proctoring/dualview/* endpoints.
 */
@RestController
@RequestMapping("/api/v1/proctoring/dualview")
public class DualViewProctoringController {

    private final DualViewProctoringService dvService;
    private final CorrelationEngineService correlationEngine;
    private final RiskScoringService riskScoringService;
    private final IncidentService incidentService;
    private final EvidenceStorageService evidenceStorageService;
    private final SseStreamService sseStreamService;
    private final DualViewSessionRepository dvSessionRepo;
    private final ProctoringIncidentRepository incidentRepo;
    private final ProctoringEvidenceRepository evidenceRepo;
    private final AssessmentSessionRepository assessmentSessionRepo;
    private final JwtUtil jwtUtil;
    private final java.net.http.HttpClient httpClient = java.net.http.HttpClient.newBuilder()
            .version(java.net.http.HttpClient.Version.HTTP_1_1)
            .connectTimeout(java.time.Duration.ofMillis(2000))
            .build();
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    public DualViewProctoringController(
            DualViewProctoringService dvService,
            CorrelationEngineService correlationEngine,
            RiskScoringService riskScoringService,
            IncidentService incidentService,
            EvidenceStorageService evidenceStorageService,
            SseStreamService sseStreamService,
            DualViewSessionRepository dvSessionRepo,
            ProctoringIncidentRepository incidentRepo,
            ProctoringEvidenceRepository evidenceRepo,
            AssessmentSessionRepository assessmentSessionRepo,
            JwtUtil jwtUtil) {
        this.dvService = dvService;
        this.correlationEngine = correlationEngine;
        this.riskScoringService = riskScoringService;
        this.incidentService = incidentService;
        this.evidenceStorageService = evidenceStorageService;
        this.sseStreamService = sseStreamService;
        this.dvSessionRepo = dvSessionRepo;
        this.incidentRepo = incidentRepo;
        this.evidenceRepo = evidenceRepo;
        this.assessmentSessionRepo = assessmentSessionRepo;
        this.jwtUtil = jwtUtil;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Session lifecycle
    // ──────────────────────────────────────────────────────────────────────────

    /** Initiate a dualview proctoring session (called from desktop before assessment starts) */
    @PostMapping("/initiate")
    public ResponseEntity<?> initiate(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID assessmentSessionId = UUID.fromString((String) body.get("assessmentSessionId"));
        UUID candidateId = body.get("candidateId") != null
                ? UUID.fromString((String) body.get("candidateId"))
                : extractUserId(request);
        UUID opportunityId = body.get("opportunityId") != null
                ? UUID.fromString((String) body.get("opportunityId")) : null;

        DualViewSession session = dvService.initiateDualViewSession(assessmentSessionId, candidateId, opportunityId);

        return ResponseEntity.ok(Map.of(
            "procSessionId", session.getId(),
            "status", session.getStatus(),
            "mobilePaired", session.getMobilePaired()
        ));
    }

    /** Record candidate consent */
    @PostMapping("/{id}/consent")
    public ResponseEntity<?> consent(@PathVariable UUID id) {
        dvService.recordConsent(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    /** Generate pairing token for QR code */
    @PostMapping("/{id}/pairing-token")
    public ResponseEntity<?> generatePairingToken(@PathVariable UUID id, HttpServletRequest request) {
        String token = dvService.generatePairingToken(id);
        // Return full pairing URL for QR code
        String baseUrl = request.getScheme() + "://" + request.getServerName();
        int port = request.getServerPort();
        if (port != 80 && port != 443) {
            // For mobile access, use the web frontend port (5173 in dev)
            baseUrl = baseUrl.replace("8085", "5173");
        }
        String pairingUrl = baseUrl + "/proctor?token=" + token;

        return ResponseEntity.ok(Map.of(
            "token", token,
            "pairingUrl", pairingUrl,
            "expiresInSeconds", 300
        ));
    }

    /** Mobile device calls this to join the session */
    @PostMapping("/pair")
    public ResponseEntity<?> pair(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String token = body.get("token");
        String userAgent = request.getHeader("User-Agent");
        String fingerprint = body.getOrDefault("fingerprint", "");

        DualViewSession session = dvService.consumePairingToken(token, userAgent, fingerprint);
        return ResponseEntity.ok(Map.of(
            "procSessionId", session.getId(),
            "status", session.getStatus(),
            "ok", true
        ));
    }

    /** Get current session status */
    @GetMapping("/{id}/status")
    public ResponseEntity<?> getStatus(@PathVariable UUID id) {
        DualViewSession session = dvService.getSession(id);
        if (session == null) {
            return ResponseEntity.ok(Map.of(
                "procSessionId", id,
                "status", "ACTIVE",
                "mobilePaired", false,
                "riskScore", 0,
                "riskLevel", "NORMAL",
                "reviewRequired", false,
                "laptopCameraHealth", "UNKNOWN",
                "mobileCameraHealth", "UNKNOWN"
            ));
        }
        return ResponseEntity.ok(Map.of(
            "procSessionId", session.getId(),
            "status", session.getStatus(),
            "mobilePaired", session.getMobilePaired(),
            "riskScore", session.getRiskScore(),
            "riskLevel", session.getRiskLevel(),
            "reviewRequired", session.getReviewRequired(),
            "laptopCameraHealth", session.getLaptopCameraHealth(),
            "mobileCameraHealth", session.getMobileCameraHealth()
        ));
    }

    /** Heartbeat from laptop or mobile */
    @PostMapping("/{id}/heartbeat")
    public ResponseEntity<?> heartbeat(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        String deviceType = (String) body.getOrDefault("deviceType", "LAPTOP");
        boolean cameraActive = Boolean.TRUE.equals(body.get("cameraActive"));
        boolean micActive = Boolean.TRUE.equals(body.get("micActive"));
        dvService.recordHeartbeat(id, deviceType, cameraActive, micActive);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    /** Activate proctoring when exam starts */
    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable UUID id) {
        dvService.activateSession(id);
        return ResponseEntity.ok(Map.of("ok", true, "status", "ACTIVE"));
    }

    /** Complete proctoring when exam ends */
    @PostMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable UUID id) {
        DualViewSession session = dvService.completeSession(id);
        correlationEngine.clearSession(id.toString());
        return ResponseEntity.ok(Map.of(
            "procSessionId", session.getId(),
            "status", session.getStatus(),
            "riskScore", session.getRiskScore(),
            "riskLevel", session.getRiskLevel(),
            "reviewRequired", session.getReviewRequired()
        ));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Event ingestion
    // ──────────────────────────────────────────────────────────────────────────

    /** Receive batched laptop AI events (aggregated, not per-frame) */
    @PostMapping("/{id}/laptop-events")
    public ResponseEntity<?> laptopEvents(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> events = (List<Map<String, Object>>) body.get("events");
        String questionId = (String) body.get("currentQuestionId");

        if (events != null) {
            for (Map<String, Object> event : events) {
                String eventType = (String) event.get("eventType");
                double confidence = event.get("confidence") instanceof Number
                        ? ((Number) event.get("confidence")).doubleValue() : 0.7;
                correlationEngine.recordSignal(id.toString(), eventType, "LAPTOP_CAMERA",
                        confidence, questionId);
            }
        }
        return ResponseEntity.ok(Map.of("ok", true));
    }

    /** Receive mobile frame (base64 JPEG) — relay to AI service */
    @PostMapping("/{id}/mobile-frame")
    public ResponseEntity<?> mobileFrame(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        DualViewSession session = dvSessionRepo.findById(id).orElse(null);
        if (session != null) {
            session.setMobileCameraHealth("HEALTHY");
            if (!"ACTIVE".equals(session.getStatus()) && !"COMPLETED".equals(session.getStatus())) {
                session.setStatus("STREAMING");
            }
            session.setUpdatedAt(java.time.OffsetDateTime.now());
            dvSessionRepo.save(session);
        }

        boolean secondPersonDetected = false;
        boolean phoneDetected = false;
        boolean cameraObstructed = false;
        boolean candidateAbsent = false;
        String warningMessage = null;

        try {
            String frameData = (String) body.get("frameData");
            if (frameData != null && !frameData.isEmpty()) {
                Map<String, Object> aiReq = Map.of(
                    "procSessionId", id.toString(),
                    "frameData", frameData,
                    "timestamp", System.currentTimeMillis()
                );
                String reqJson = objectMapper.writeValueAsString(aiReq);
                var httpRequest = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("http://localhost:8000/analyze/mobile-frame"))
                    .header("Content-Type", "application/json")
                    .timeout(java.time.Duration.ofMillis(1800))
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(reqJson))
                    .build();

                var httpResponse = httpClient.send(httpRequest, java.net.http.HttpResponse.BodyHandlers.ofString());
                if (httpResponse.statusCode() == 200) {
                    var aiResp = objectMapper.readValue(httpResponse.body(), Map.class);
                    int personCount = aiResp.get("personCount") instanceof Number ? ((Number) aiResp.get("personCount")).intValue() : 1;
                    Boolean secondaryDevice = (Boolean) aiResp.get("secondaryDeviceDetected");
                    Boolean obstructed = (Boolean) aiResp.get("cameraObstructed");
                    Boolean absent = (Boolean) aiResp.get("candidateAbsent");

                    List<?> eventsList = (List<?>) aiResp.get("events");
                    if (eventsList != null) {
                        for (Object evtObj : eventsList) {
                            if (evtObj instanceof Map<?, ?> evtMap) {
                                String evType = (String) evtMap.get("eventType");
                                if ("CAMERA_OBSTRUCTION".equals(evType)) {
                                    obstructed = true;
                                } else if ("NO_PERSON_DETECTED".equals(evType)) {
                                    absent = true;
                                }
                            }
                        }
                    }

                    if (Boolean.TRUE.equals(obstructed)) {
                        cameraObstructed = true;
                        correlationEngine.recordSignal(id.toString(), "CAMERA_COVERED", "MOBILE_CAMERA", 0.96, null);
                        incidentService.createIncident(id, "CAMERA_TAMPERING", "CRITICAL", 0.96, 30, null, List.of("MOBILE_CAMERA"), 1);
                        warningMessage = "WARNING: Camera lens covered or obstructed! Uncover lens immediately!";
                    } else if (Boolean.TRUE.equals(absent) || personCount == 0) {
                        candidateAbsent = true;
                        correlationEngine.recordSignal(id.toString(), "FACE_MISSING", "MOBILE_CAMERA", 0.95, null);
                        incidentService.createIncident(id, "CANDIDATE_ABSENT", "HIGH", 0.95, 20, null, List.of("MOBILE_CAMERA"), 1);
                        warningMessage = "WARNING: Candidate not visible in workspace view! Return immediately!";
                    } else if (personCount > 1) {
                        secondPersonDetected = true;
                        correlationEngine.recordSignal(id.toString(), "SECOND_PERSON", "MOBILE_CAMERA", 0.92, null);
                        incidentService.createIncident(id, "SECOND_PERSON", "HIGH", 0.92, 25, null, List.of("MOBILE_CAMERA"), 1);
                        warningMessage = "WARNING: Additional person detected in secondary camera view";
                    }

                    if (Boolean.TRUE.equals(secondaryDevice)) {
                        phoneDetected = true;
                        correlationEngine.recordSignal(id.toString(), "PHONE_DETECTED", "MOBILE_CAMERA", 0.98, null);
                        incidentService.createIncident(id, "PHONE_DETECTED", "CRITICAL", 0.98, 50, null, List.of("MOBILE_CAMERA"), 1);
                        warningMessage = "CRITICAL VIOLATION: Mobile phone detected! Test terminating!";
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[DualViewProctoringController] AI service call error: " + e.getMessage());
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("ok", true);
        resp.put("secondPersonDetected", secondPersonDetected);
        resp.put("phoneDetected", phoneDetected);
        resp.put("cameraObstructed", cameraObstructed);
        resp.put("candidateAbsent", candidateAbsent);
        if (warningMessage != null) {
            resp.put("warningMessage", warningMessage);
        }
        return ResponseEntity.ok(resp);
    }

    /** Receive mobile audio chunk */
    @PostMapping("/{id}/mobile-audio")
    public ResponseEntity<?> mobileAudio(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        // TODO Phase 4: relay audio chunk to AI service, record audio signals
        return ResponseEntity.ok(Map.of("ok", true));
    }

    /** Mobile disconnect notification */
    @PostMapping("/{id}/mobile-disconnect")
    public ResponseEntity<?> mobileDisconnect(@PathVariable UUID id) {
        dvService.handleMobileDisconnect(id);
        correlationEngine.recordSignal(id.toString(), "MOBILE_DISCONNECTED", "SYSTEM", 1.0, null);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Incidents & Evidence
    // ──────────────────────────────────────────────────────────────────────────

    /** Direct violation incident logging from Desktop Lockdown AI Rule Engine */
    @PostMapping("/{id}/incidents")
    public ResponseEntity<?> createIncident(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        String incidentType = (String) body.getOrDefault("incidentType", "POLICY_VIOLATION");
        String severity = (String) body.getOrDefault("severity", "MEDIUM");
        double confidence = body.get("confidence") instanceof Number
                ? ((Number) body.get("confidence")).doubleValue() : 0.85;
        int riskContribution = body.get("riskContribution") instanceof Number
                ? ((Number) body.get("riskContribution")).intValue() : 25;
        String questionId = (String) body.get("questionId");
        
        List<String> sources = new ArrayList<>();
        if (body.get("sources") instanceof List<?> list) {
            for (Object item : list) {
                if (item != null) sources.add(item.toString());
            }
        }
        if (sources.isEmpty() && body.get("source") != null) {
            sources.add(body.get("source").toString());
        }

        ProctoringIncident incident = incidentService.createIncident(
                id, incidentType, severity, confidence, riskContribution, questionId, sources, sources.size()
        );

        String evidenceBase64 = (String) body.get("evidenceBase64");
        if (evidenceBase64 != null && !evidenceBase64.isBlank()) {
            try {
                if (evidenceBase64.contains(",")) {
                    evidenceBase64 = evidenceBase64.substring(evidenceBase64.indexOf(",") + 1);
                }
                byte[] imageBytes = Base64.getDecoder().decode(evidenceBase64);
                String deviceSource = sources.isEmpty() ? "LAPTOP_CAMERA" : sources.get(0);
                incidentService.recordFrameEvidence(incident.getId(), deviceSource, imageBytes, id);
            } catch (Exception e) {
                System.err.println("[DualViewProctoringController] Failed to record snapshot evidence: " + e.getMessage());
            }
        }

        return ResponseEntity.ok(Map.of(
            "incidentId", incident.getId(),
            "incidentType", incident.getIncidentType(),
            "severity", incident.getSeverity(),
            "status", "RECORDED"
        ));
    }

    /** List all incidents for a session */
    @GetMapping("/{id}/incidents")
    public ResponseEntity<?> getIncidents(@PathVariable UUID id) {
        DualViewSession session = dvService.getSession(id);
        UUID queryId = session != null ? session.getId() : id;
        return ResponseEntity.ok(incidentService.getIncidentsForSession(queryId));
    }

    /** Recruiter reviews an incident */
    @PostMapping("/{id}/incidents/{incidentId}/review")
    public ResponseEntity<?> reviewIncident(
            @PathVariable UUID id,
            @PathVariable UUID incidentId,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        UUID reviewerId = extractUserId(request);
        String action = body.get("action"); // DISMISSED | VIOLATION_CONFIRMED | ACKNOWLEDGED
        String notes = body.getOrDefault("notes", "");
        var incident = incidentService.reviewIncident(incidentId, reviewerId, action, notes);
        return ResponseEntity.ok(Map.of(
            "incidentId", incident.getId(),
            "reviewerAction", incident.getReviewerAction(),
            "reviewedAt", incident.getReviewedAt()
        ));
    }

    /** Chronological event + incident timeline for a session */
    @GetMapping("/{id}/timeline")
    public ResponseEntity<?> getTimeline(@PathVariable UUID id) {
        DualViewSession session = dvService.getSession(id);
        if (session == null) {
            return ResponseEntity.ok(Map.of(
                "procSessionId", id,
                "candidateId", id,
                "riskScore", 0,
                "riskLevel", "NORMAL",
                "reviewRequired", false,
                "incidents", List.of()
            ));
        }
        List<Map<String, Object>> incidents = incidentService.getIncidentsForSession(session.getId());

        Map<String, Object> timeline = new LinkedHashMap<>();
        timeline.put("procSessionId", session.getId());
        timeline.put("candidateId", session.getCandidateId());
        timeline.put("riskScore", session.getRiskScore());
        timeline.put("riskLevel", session.getRiskLevel());
        timeline.put("reviewRequired", session.getReviewRequired());
        timeline.put("incidents", incidents);
        timeline.put("startedAt", session.getStartedAt());
        timeline.put("completedAt", session.getCompletedAt());

        return ResponseEntity.ok(timeline);
    }

    /** Full proctoring report for recruiter */
    @GetMapping("/{id}/report")
    public ResponseEntity<?> getReport(@PathVariable UUID id) {
        DualViewSession session = dvService.getSession(id);
        if (session == null && assessmentSessionRepo != null) {
            AssessmentSession as = assessmentSessionRepo.findById(id).orElse(null);
            if (as != null) {
                session = dvService.initiateDualViewSession(as.getId(), as.getStudentId(), as.getOpportunityId());
                if ("SUBMITTED".equals(as.getStatus()) || "COMPLETED".equals(as.getStatus())) {
                    session.setStatus("COMPLETED");
                }
                if (as.getStartedAt() != null) session.setStartedAt(as.getStartedAt());
                if (as.getCompletedAt() != null) session.setCompletedAt(as.getCompletedAt());
                else if (as.getSubmittedAt() != null) session.setCompletedAt(as.getSubmittedAt());
                session = dvSessionRepo.save(session);
            }
        }

        if (session == null) {
            Map<String, Object> fallback = new LinkedHashMap<>();
            fallback.put("procSessionId", id);
            fallback.put("assessmentSessionId", id);
            fallback.put("candidateId", id);
            fallback.put("status", "COMPLETED");
            fallback.put("riskScore", 0);
            fallback.put("riskLevel", "NORMAL");
            fallback.put("reviewRequired", false);
            fallback.put("laptopCameraHealth", "HEALTHY");
            fallback.put("mobileCameraHealth", "HEALTHY");
            fallback.put("mobilePaired", true);
            fallback.put("incidentSummary", Map.of("total", 0, "high", 0, "medium", 0, "low", 0, "pendingReview", 0));
            fallback.put("incidents", List.of());
            return ResponseEntity.ok(fallback);
        }

        List<Map<String, Object>> incidents = incidentService.getIncidentsForSession(session.getId());

        long highCount = incidents.stream().filter(i -> "HIGH".equals(i.get("severity")) || "CRITICAL".equals(i.get("severity"))).count();
        long mediumCount = incidents.stream().filter(i -> "MEDIUM".equals(i.get("severity"))).count();
        long lowCount = incidents.stream().filter(i -> "LOW".equals(i.get("severity"))).count();
        long pendingReview = incidents.stream().filter(i -> i.get("reviewerAction") == null).count();

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("procSessionId", session.getId());
        report.put("assessmentSessionId", session.getAssessmentSessionId());
        report.put("candidateId", session.getCandidateId());
        report.put("status", session.getStatus());
        report.put("riskScore", session.getRiskScore());
        report.put("riskLevel", session.getRiskLevel());
        report.put("reviewRequired", session.getReviewRequired());
        report.put("reviewerDecision", session.getReviewerDecision());
        report.put("reviewedAt", session.getReviewedAt());
        report.put("laptopCameraHealth", session.getLaptopCameraHealth());
        report.put("mobileCameraHealth", session.getMobileCameraHealth());
        report.put("mobilePaired", session.getMobilePaired());
        report.put("startedAt", session.getStartedAt());
        report.put("completedAt", session.getCompletedAt());
        report.put("incidentSummary", Map.of(
            "total", incidents.size(),
            "high", highCount,
            "medium", mediumCount,
            "low", lowCount,
            "pendingReview", pendingReview
        ));
        report.put("incidents", incidents);

        return ResponseEntity.ok(report);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // SSE Stream
    // ──────────────────────────────────────────────────────────────────────────

    /** Desktop and recruiter dashboard subscribe to real-time updates */
    @GetMapping(value = "/stream/{procSessionId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable String procSessionId) {
        return sseStreamService.subscribe(procSessionId);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    private UUID extractUserId(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                return jwtUtil.getUserId(token);
            }
        } catch (Exception e) {
            // fallback
        }
        return UUID.randomUUID();
    }
}

