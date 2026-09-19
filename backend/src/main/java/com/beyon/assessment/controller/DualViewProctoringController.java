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
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.*;
import java.util.stream.Collectors;

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
    private final FlociProctoringAiService flociAiService;
    private final java.net.http.HttpClient httpClient = java.net.http.HttpClient.newBuilder()
            .version(java.net.http.HttpClient.Version.HTTP_1_1)
            .connectTimeout(java.time.Duration.ofMillis(2000))
            .build();
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
    private final Map<UUID, Integer> secondPersonStreakMap = new java.util.concurrent.ConcurrentHashMap<>();
    private final Map<UUID, Integer> absentStreakMap = new java.util.concurrent.ConcurrentHashMap<>();
    private final Map<UUID, Long> lastIncidentTimeMap = new java.util.concurrent.ConcurrentHashMap<>();

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
            JwtUtil jwtUtil,
            FlociProctoringAiService flociAiService) {
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
        this.flociAiService = flociAiService;
    }

    public static String resolveLanIp() {
        try {
            List<NetworkInterface> interfaces = Collections.list(NetworkInterface.getNetworkInterfaces());
            interfaces.sort((a, b) -> {
                String an = (a.getName() + " " + a.getDisplayName()).toLowerCase();
                String bn = (b.getName() + " " + b.getDisplayName()).toLowerCase();
                boolean aWifi = an.contains("wi-fi") || an.contains("wireless") || an.contains("wlan");
                boolean bWifi = bn.contains("wi-fi") || bn.contains("wireless") || bn.contains("wlan");
                if (aWifi && !bWifi) return -1;
                if (!aWifi && bWifi) return 1;
                return 0;
            });

            for (NetworkInterface iface : interfaces) {
                if (iface.isLoopback() || !iface.isUp() || iface.isVirtual()) continue;
                String name = iface.getName().toLowerCase();
                String displayName = iface.getDisplayName().toLowerCase();
                if (name.contains("vethernet") || name.contains("wsl") || name.contains("docker") ||
                    name.contains("tailscale") || displayName.contains("virtual") || displayName.contains("hyper-v")) {
                    continue;
                }
                for (InetAddress addr : Collections.list(iface.getInetAddresses())) {
                    if (addr instanceof Inet4Address && !addr.isLoopbackAddress() && !addr.isLinkLocalAddress()) {
                        String hostAddress = addr.getHostAddress();
                        if (hostAddress.startsWith("10.1.32.") || hostAddress.startsWith("192.168.") || hostAddress.startsWith("10.") || hostAddress.startsWith("172.")) {
                            return hostAddress;
                        }
                    }
                }
            }
            InetAddress localHost = InetAddress.getLocalHost();
            if (localHost instanceof Inet4Address && !localHost.isLoopbackAddress()) {
                return localHost.getHostAddress();
            }
        } catch (Exception ignored) {}
        return "10.1.32.243";
    }

    private UUID parseUuid(String raw) {
        if (raw == null || raw.isBlank() || "undefined".equalsIgnoreCase(raw) || "null".equalsIgnoreCase(raw)) {
            return null;
        }
        try {
            return UUID.fromString(raw.trim());
        } catch (Exception e) {
            return UUID.nameUUIDFromBytes(raw.trim().getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    @PostMapping("/initiate")
    public ResponseEntity<?> initiate(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID assessmentSessionId = parseUuid(body != null ? Objects.toString(body.get("assessmentSessionId"), null) : null);
        if (assessmentSessionId == null) {
            assessmentSessionId = UUID.randomUUID();
        }

        UUID candidateId = parseUuid(body != null ? Objects.toString(body.get("candidateId"), null) : null);
        if (candidateId == null) {
            candidateId = extractUserId(request);
        }

        UUID opportunityId = parseUuid(body != null ? Objects.toString(body.get("opportunityId"), null) : null);

        DualViewSession session = dvService.initiateDualViewSession(assessmentSessionId, candidateId, opportunityId);

        return ResponseEntity.ok(Map.of(
            "procSessionId", session.getId(),
            "status", session.getStatus(),
            "mobilePaired", session.getMobilePaired()
        ));
    }

    @PostMapping("/{id}/consent")
    public ResponseEntity<?> consent(@PathVariable String id) {
        UUID uuid = parseUuid(id);
        if (uuid != null) {
            try {
                dvService.recordConsent(uuid);
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/{id}/pairing-token")
    public ResponseEntity<?> generatePairingToken(@PathVariable String id, HttpServletRequest request) {
        UUID uuid = parseUuid(id);
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
        String token = dvService.generatePairingToken(uuid);
        String lanIp = resolveLanIp();
        String pairingUrl = "https://" + lanIp + ":5173/proctor?token=" + token;

        return ResponseEntity.ok(Map.of(
            "token", token,
            "pairingUrl", pairingUrl,
            "lanIp", lanIp,
            "expiresInSeconds", 300
        ));
    }

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

    @GetMapping("/{id}/status")
    public ResponseEntity<?> getStatus(@PathVariable String id) {
        UUID uuid = parseUuid(id);
        DualViewSession session = uuid != null ? dvService.getSession(uuid) : null;
        if (session == null) {
            return ResponseEntity.ok(Map.of(
                "procSessionId", uuid != null ? uuid.toString() : "",
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

    @PostMapping("/{id}/heartbeat")
    public ResponseEntity<?> heartbeat(@PathVariable String id, @RequestBody Map<String, Object> body) {
        UUID uuid = parseUuid(id);
        if (uuid != null) {
            String deviceType = (String) body.getOrDefault("deviceType", "LAPTOP");
            boolean cameraActive = Boolean.TRUE.equals(body.get("cameraActive"));
            boolean micActive = Boolean.TRUE.equals(body.get("micActive"));
            try {
                dvService.recordHeartbeat(uuid, deviceType, cameraActive, micActive);
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable String id) {
        UUID uuid = parseUuid(id);
        if (uuid != null) {
            try {
                dvService.activateSession(uuid);
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(Map.of("ok", true, "status", "ACTIVE"));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable String id) {
        UUID uuid = parseUuid(id);
        if (uuid == null) {
            return ResponseEntity.ok(Map.of("ok", true, "status", "COMPLETED"));
        }
        try {
            DualViewSession session = dvService.completeSession(uuid);
            correlationEngine.clearSession(uuid.toString());
            return ResponseEntity.ok(Map.of(
                "procSessionId", session.getId(),
                "status", session.getStatus(),
                "riskScore", session.getRiskScore(),
                "riskLevel", session.getRiskLevel(),
                "reviewRequired", session.getReviewRequired()
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("procSessionId", uuid, "status", "COMPLETED", "riskScore", 0, "riskLevel", "NORMAL", "reviewRequired", false));
        }
    }

    @PostMapping("/{id}/laptop-events")
    public ResponseEntity<?> laptopEvents(@PathVariable String id, @RequestBody Map<String, Object> body) {
        UUID uuid = parseUuid(id);
        if (uuid == null) {
            return ResponseEntity.ok(Map.of("ok", true));
        }
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> events = (List<Map<String, Object>>) body.get("events");
        String questionId = (String) body.get("currentQuestionId");

        if (events != null) {
            for (Map<String, Object> event : events) {
                String eventType = (String) event.get("eventType");
                double confidence = event.get("confidence") instanceof Number
                        ? ((Number) event.get("confidence")).doubleValue() : 0.7;
                correlationEngine.recordSignal(uuid.toString(), eventType, "LAPTOP_CAMERA",
                        confidence, questionId);
            }
        }
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private byte[] decodeBase64Image(String frameData) {
        if (frameData == null || frameData.isEmpty()) return null;
        String b64 = frameData;
        if (b64.contains(",")) {
            b64 = b64.substring(b64.indexOf(",") + 1);
        }
        try {
            return Base64.getDecoder().decode(b64);
        } catch (Exception e) {
            return null;
        }
    }

    @PostMapping("/{id}/mobile-frame")
    public ResponseEntity<?> mobileFrame(@PathVariable String id, @RequestBody Map<String, Object> body) {
        UUID uuid = parseUuid(id);
        if (uuid == null) {
            return ResponseEntity.ok(Map.of("ok", true));
        }
        DualViewSession session = dvSessionRepo.findById(uuid).orElse(null);
        if (session != null) {
            session.setMobileCameraHealth("HEALTHY");
            if (!"ACTIVE".equals(session.getStatus()) && !"COMPLETED".equals(session.getStatus())) {
                session.setStatus("STREAMING");
            }
            session.setUpdatedAt(java.time.OffsetDateTime.now());
            dvSessionRepo.save(session);
        }

        String frameData = (String) body.get("frameData");
        byte[] frameBytes = decodeBase64Image(frameData);

        // Call FastAPI AI Service on port 8000
        int aiPersonCount = 1;
        boolean aiSecondaryDevice = false;
        boolean aiCameraObstructed = false;
        boolean aiCandidateAbsent = false;

        if (frameData != null && !frameData.isEmpty()) {
            try {
                Map<String, Object> aiReq = Map.of("frameData", frameData);
                String aiJson = objectMapper.writeValueAsString(aiReq);
                java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                        .uri(java.net.URI.create("http://localhost:8000/analyze/mobile-frame"))
                        .header("Content-Type", "application/json")
                        .timeout(java.time.Duration.ofMillis(1500))
                        .POST(java.net.http.HttpRequest.BodyPublishers.ofString(aiJson))
                        .build();

                java.net.http.HttpResponse<String> response = httpClient.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() == 200) {
                    Map<String, Object> aiResp = objectMapper.readValue(response.body(), Map.class);
                    if (aiResp.get("personCount") instanceof Number) {
                        aiPersonCount = ((Number) aiResp.get("personCount")).intValue();
                    }
                    aiSecondaryDevice = Boolean.TRUE.equals(aiResp.get("secondaryDeviceDetected"));
                    aiCameraObstructed = Boolean.TRUE.equals(aiResp.get("cameraObstructed"));
                    aiCandidateAbsent = Boolean.TRUE.equals(aiResp.get("candidateAbsent"));
                }
            } catch (Exception ignored) {}
        }

        // Run local Floci AWS Rekognition, S3, and DynamoDB pipeline
        FlociProctoringAiService.FrameAnalysisResult flociResult = null;
        if (frameBytes != null) {
            flociResult = flociAiService.analyzeFrame(uuid, frameBytes, "MOBILE");
        }

        boolean secondPersonDetected = (aiPersonCount >= 2) || (flociResult != null && flociResult.multipleFaces);
        boolean phoneDetected = aiSecondaryDevice || (flociResult != null && flociResult.phoneDetected);
        boolean candidateAbsent = (aiCandidateAbsent && aiPersonCount == 0) || (flociResult != null && flociResult.candidateAbsent);
        boolean cameraObstructed = aiCameraObstructed;
        String warningMessage = null;

        if (phoneDetected) {
            warningMessage = "CRITICAL VIOLATION: Mobile phone detected! Strike recorded.";
            correlationEngine.recordSignal(uuid.toString(), "PHONE_DETECTED", "MOBILE_CAMERA", 0.95, null);
        } else if (secondPersonDetected) {
            warningMessage = "WARNING: Additional person detected in camera view.";
            correlationEngine.recordSignal(uuid.toString(), "SECOND_PERSON_DETECTED", "MOBILE_CAMERA", 0.92, null);
        } else if (cameraObstructed) {
            warningMessage = "CRITICAL WARNING: Camera lens covered or obstructed! Uncover immediately!";
            correlationEngine.recordSignal(uuid.toString(), "CAMERA_OBSTRUCTION", "MOBILE_CAMERA", 0.95, null);
        } else if (candidateAbsent) {
            warningMessage = "WARNING: Candidate not visible in workspace view!";
            correlationEngine.recordSignal(uuid.toString(), "CANDIDATE_ABSENT", "MOBILE_CAMERA", 0.90, null);
        }

        int strikes = flociAiService.getStrikes(uuid);

        Map<String, Object> resp = new HashMap<>();
        resp.put("ok", true);
        resp.put("secondPersonDetected", secondPersonDetected);
        resp.put("phoneDetected", phoneDetected);
        resp.put("cameraObstructed", cameraObstructed);
        resp.put("candidateAbsent", candidateAbsent);
        resp.put("strikes", strikes);
        if (flociResult != null) {
            resp.put("evidenceS3Key", flociResult.evidenceS3Key);
            resp.put("riskDelta", flociResult.calculatedRiskDelta);
            resp.put("primaryViolation", flociResult.primaryViolation);
            resp.put("detectedLabels", flociResult.detectedLabels);
        }
        if (warningMessage != null) {
            resp.put("warningMessage", warningMessage);
        }
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/{id}/laptop-frame")
    public ResponseEntity<?> laptopFrame(@PathVariable String id, @RequestBody Map<String, Object> body) {
        UUID uuid = parseUuid(id);
        if (uuid == null) {
            return ResponseEntity.ok(Map.of("ok", true));
        }
        String frameData = (String) body.get("frameData");
        byte[] frameBytes = decodeBase64Image(frameData);

        FlociProctoringAiService.FrameAnalysisResult flociResult = null;
        if (frameBytes != null) {
            flociResult = flociAiService.analyzeFrame(uuid, frameBytes, "LAPTOP");
        }

        int strikes = flociAiService.getStrikes(uuid);
        Map<String, Object> resp = new HashMap<>();
        resp.put("ok", true);
        resp.put("strikes", strikes);
        if (flociResult != null) {
            resp.put("evidenceS3Key", flociResult.evidenceS3Key);
            resp.put("riskDelta", flociResult.calculatedRiskDelta);
            resp.put("primaryViolation", flociResult.primaryViolation);
            resp.put("detectedLabels", flociResult.detectedLabels);
        }
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/{id}/mobile-audio")
    public ResponseEntity<?> mobileAudio(@PathVariable String id, @RequestBody Map<String, Object> body) {
        UUID uuid = parseUuid(id);
        if (uuid == null) {
            return ResponseEntity.ok(Map.of("ok", true, "flagged", false, "strikes", 0));
        }
        String audioData = (String) body.get("audioData");
        byte[] audioBytes = decodeBase64Image(audioData);
        boolean flagged = flociAiService.analyzeAudioChunk(uuid, audioBytes);
        return ResponseEntity.ok(Map.of("ok", true, "flagged", flagged, "strikes", flociAiService.getStrikes(uuid)));
    }

    @PostMapping("/{id}/telemetry")
    public ResponseEntity<?> telemetryEvent(@PathVariable String id, @RequestBody Map<String, Object> body) {
        UUID uuid = parseUuid(id);
        if (uuid == null) {
            return ResponseEntity.ok(Map.of("ok", true, "strikes", 0));
        }
        String eventType = (String) body.getOrDefault("eventType", "TAB_SWITCH");
        String metadata = (String) body.get("metadata");
        flociAiService.recordTelemetryIncident(uuid, eventType, metadata);
        return ResponseEntity.ok(Map.of("ok", true, "strikes", flociAiService.getStrikes(uuid)));
    }

    @GetMapping("/{id}/dynamo-incidents")
    public ResponseEntity<?> getDynamoIncidents(@PathVariable String id) {
        UUID uuid = parseUuid(id);
        if (uuid == null) {
            return ResponseEntity.ok(Map.of("success", true, "data", List.of(), "strikes", 0));
        }
        List<Map<String, Object>> incidents = flociAiService.getIncidentsFromDynamoDb(uuid);
        return ResponseEntity.ok(Map.of("success", true, "data", incidents, "strikes", flociAiService.getStrikes(uuid)));
    }

    @PostMapping("/{id}/mobile-disconnect")
    public ResponseEntity<?> mobileDisconnect(@PathVariable String id) {
        UUID uuid = parseUuid(id);
        if (uuid != null) {
            try {
                dvService.handleMobileDisconnect(uuid);
                correlationEngine.recordSignal(uuid.toString(), "MOBILE_DISCONNECTED", "SYSTEM", 1.0, null);
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/{id}/incidents")
    public ResponseEntity<?> createIncident(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        UUID uuid = parseUuid(id);
        if (uuid == null) {
            return ResponseEntity.ok(Map.of("status", "IGNORED"));
        }
        String incidentType = (String) body.getOrDefault("incidentType", "POLICY_VIOLATION");
        String severity = (String) body.getOrDefault("severity", "MEDIUM");
        double confidence = body.get("confidence") instanceof Number
                ? ((Number) body.get("confidence")).doubleValue() : 0.85;
        int riskContribution = body.get("riskContribution") instanceof Number
                ? ((Number) body.get("riskContribution")).intValue() : 25;
        String questionId = (String) body.get("questionId");
        String testName = (String) body.get("testName");
        String studentName = (String) body.get("studentName");
        String warningName = (String) body.getOrDefault("warningName", incidentType);

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
                uuid, incidentType, severity, confidence, riskContribution, questionId, sources, sources.size()
        );

        String evidenceBase64 = (String) body.get("evidenceBase64");
        if (evidenceBase64 != null && !evidenceBase64.isBlank()) {
            try {
                if (evidenceBase64.contains(",")) {
                    evidenceBase64 = evidenceBase64.substring(evidenceBase64.indexOf(",") + 1);
                }
                byte[] imageBytes = Base64.getDecoder().decode(evidenceBase64);
                String deviceSource = sources.isEmpty() ? "LAPTOP_CAMERA" : sources.get(0);
                incidentService.recordFrameEvidence(incident.getId(), deviceSource, imageBytes, uuid, testName, studentName, warningName);
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

    @GetMapping("/{id}/incidents")
    public ResponseEntity<?> getIncidents(@PathVariable String id) {
        UUID uuid = parseUuid(id);
        if (uuid == null) {
            return ResponseEntity.ok(List.of());
        }
        DualViewSession session = dvService.getSession(uuid);
        UUID queryId = session != null ? session.getId() : uuid;
        return ResponseEntity.ok(incidentService.getIncidentsForSession(queryId));
    }

    @PostMapping("/{id}/incidents/{incidentId}/review")
    public ResponseEntity<?> reviewIncident(
            @PathVariable String id,
            @PathVariable UUID incidentId,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        UUID reviewerId = extractUserId(request);
        String action = body.get("action");
        String notes = body.getOrDefault("notes", "");
        var incident = incidentService.reviewIncident(incidentId, reviewerId, action, notes);
        return ResponseEntity.ok(Map.of(
            "incidentId", incident.getId(),
            "reviewerAction", incident.getReviewerAction(),
            "reviewedAt", incident.getReviewedAt()
        ));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<?> getTimeline(@PathVariable String id) {
        UUID uuid = parseUuid(id);
        if (uuid == null) {
            return ResponseEntity.ok(Map.of("procSessionId", id, "candidateId", id, "riskScore", 0, "riskLevel", "NORMAL", "reviewRequired", false, "incidents", List.of()));
        }
        DualViewSession session = dvService.getSession(uuid);
        if (session == null) {
            return ResponseEntity.ok(Map.of(
                "procSessionId", uuid,
                "candidateId", uuid,
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

    @GetMapping("/{id}/report")
    public ResponseEntity<?> getReport(@PathVariable String id) {
        UUID uuid = parseUuid(id);
        if (uuid == null) {
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

        DualViewSession session = dvService.getSession(uuid);
        if (session == null && assessmentSessionRepo != null) {
            AssessmentSession as = assessmentSessionRepo.findById(uuid).orElse(null);
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
            fallback.put("procSessionId", uuid);
            fallback.put("assessmentSessionId", uuid);
            fallback.put("candidateId", uuid);
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

    @GetMapping(value = "/stream/{procSessionId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable String procSessionId) {
        return sseStreamService.subscribe(procSessionId);
    }

    private UUID extractUserId(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                return jwtUtil.getUserId(token);
            }
        } catch (Exception e) {

        }
        return UUID.randomUUID();
    }
}

