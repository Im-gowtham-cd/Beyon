package com.beyon.assessment.service;

import com.beyon.assessment.model.*;
import com.beyon.assessment.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Manages proctoring incidents: creation, evidence linking, and recruiter review.
 * Incidents are only created when multi-signal correlation justifies them.
 */
@Service
@Transactional
public class IncidentService {

    private final ProctoringIncidentRepository incidentRepo;
    private final ProctoringEvidenceRepository evidenceRepo;
    private final DualViewSessionRepository dvSessionRepo;
    private final RiskScoringService riskScoringService;
    private final SseStreamService sseStreamService;
    private final EvidenceStorageService evidenceStorageService;

    public IncidentService(
            ProctoringIncidentRepository incidentRepo,
            ProctoringEvidenceRepository evidenceRepo,
            DualViewSessionRepository dvSessionRepo,
            RiskScoringService riskScoringService,
            SseStreamService sseStreamService,
            EvidenceStorageService evidenceStorageService) {
        this.incidentRepo = incidentRepo;
        this.evidenceRepo = evidenceRepo;
        this.dvSessionRepo = dvSessionRepo;
        this.riskScoringService = riskScoringService;
        this.sseStreamService = sseStreamService;
        this.evidenceStorageService = evidenceStorageService;
    }

    /**
     * Create a proctoring incident.
     * @param procSessionId  proctoring session ID
     * @param incidentType   incident type constant e.g. POSSIBLE_EXTERNAL_ASSISTANCE
     * @param severity       LOW | MEDIUM | HIGH | CRITICAL
     * @param confidence     0.0 - 1.0
     * @param riskContribution points to add to risk score
     * @param questionId     current question when incident occurred (nullable)
     * @param sources        list of signal sources e.g. ["LAPTOP_CAMERA", "MOBILE_CAMERA"]
     * @param signalCount    number of correlated signals
     * @return created incident
     */
    public ProctoringIncident createIncident(
            UUID procSessionId,
            String incidentType,
            String severity,
            double confidence,
            int riskContribution,
            String questionId,
            List<String> sources,
            int signalCount) {

        ProctoringIncident incident = new ProctoringIncident();
        incident.setProctoringSessionId(procSessionId);
        incident.setIncidentType(incidentType);
        incident.setSeverity(severity);
        incident.setConfidence(BigDecimal.valueOf(confidence));
        incident.setRiskContribution(riskContribution);
        incident.setQuestionId(questionId);
        incident.setSources(sources != null ? String.join(",", sources) : null);
        incident.setSignalCount(signalCount);
        incident.setStartedAt(OffsetDateTime.now());

        ProctoringIncident saved = incidentRepo.save(incident);

        // Apply risk contribution
        if (riskContribution > 0) {
            riskScoringService.applyEvent(procSessionId, incidentType);
        }

        // Notify via SSE
        DualViewSession session = dvSessionRepo.findById(procSessionId).orElse(null);
        if (session != null) {
            sseStreamService.pushIncidentCreated(
                procSessionId.toString(),
                saved.getId().toString(),
                incidentType,
                severity,
                confidence
            );
        }

        return saved;
    }

    /**
     * Store a frame capture as evidence for an incident.
     */
    public ProctoringEvidence recordFrameEvidence(
            UUID incidentId,
            String deviceSource,
            byte[] imageBytes,
            UUID procSessionId) {

        String url = evidenceStorageService.storeFrame(procSessionId, incidentId, deviceSource, imageBytes);

        ProctoringEvidence evidence = new ProctoringEvidence();
        evidence.setIncidentId(incidentId);
        evidence.setEvidenceType("FRAME_CAPTURE");
        evidence.setDeviceSource(deviceSource);
        evidence.setStorageUrl(url);
        evidence.setCapturedAt(OffsetDateTime.now());
        evidence.setFileSizeBytes((long) imageBytes.length);
        evidence.setAccessExpiresAt(OffsetDateTime.now().plusDays(30));

        return evidenceRepo.save(evidence);
    }

    /**
     * Recruiter reviews an incident: DISMISSED | VIOLATION_CONFIRMED | ACKNOWLEDGED
     */
    public ProctoringIncident reviewIncident(UUID incidentId, UUID reviewerId, String action, String notes) {
        ProctoringIncident incident = incidentRepo.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found: " + incidentId));

        incident.setReviewerAction(action);
        incident.setReviewerId(reviewerId);
        incident.setReviewedAt(OffsetDateTime.now());
        incident.setReviewNotes(notes);

        ProctoringIncident saved = incidentRepo.save(incident);

        // If VIOLATION_CONFIRMED, update session reviewerDecision
        if ("VIOLATION_CONFIRMED".equals(action)) {
            dvSessionRepo.findById(incident.getProctoringSessionId())
                    .ifPresent(session -> {
                        session.setReviewerDecision("VIOLATION_CONFIRMED");
                        session.setReviewerId(reviewerId);
                        session.setReviewedAt(OffsetDateTime.now());
                        dvSessionRepo.save(session);
                    });
        }

        return saved;
    }

    public List<Map<String, Object>> getIncidentsForSession(UUID procSessionId) {
        return incidentRepo.findByProctoringSessionIdOrderByStartedAtDesc(procSessionId)
                .stream()
                .map(incident -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", incident.getId());
                    m.put("incidentType", incident.getIncidentType());
                    m.put("severity", incident.getSeverity());
                    m.put("confidence", incident.getConfidence());
                    m.put("riskContribution", incident.getRiskContribution());
                    m.put("questionId", incident.getQuestionId());
                    m.put("sources", incident.getSources() != null
                        ? Arrays.asList(incident.getSources().split(",")) : List.of());
                    m.put("signalCount", incident.getSignalCount());
                    m.put("startedAt", incident.getStartedAt());
                    m.put("endedAt", incident.getEndedAt());
                    m.put("reviewerAction", incident.getReviewerAction());
                    // Include evidence
                    List<Map<String, Object>> evidenceList = evidenceRepo
                            .findByIncidentIdOrderByCapturedAt(incident.getId())
                            .stream().map(e -> {
                                Map<String, Object> em = new LinkedHashMap<>();
                                em.put("id", e.getId());
                                em.put("evidenceType", e.getEvidenceType());
                                em.put("deviceSource", e.getDeviceSource());
                                em.put("storageUrl", e.getStorageUrl());
                                em.put("capturedAt", e.getCapturedAt());
                                return em;
                            }).collect(Collectors.toList());
                    m.put("evidence", evidenceList);
                    return m;
                })
                .collect(Collectors.toList());
    }
}
