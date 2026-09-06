package com.beyon.assessment.service;

import com.beyon.assessment.model.*;
import com.beyon.assessment.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

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

        if (riskContribution > 0) {
            riskScoringService.applyEvent(procSessionId, incidentType);
        }

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

    public ProctoringEvidence recordFrameEvidence(
            UUID incidentId,
            String deviceSource,
            byte[] imageBytes,
            UUID procSessionId) {
        return recordFrameEvidence(incidentId, deviceSource, imageBytes, procSessionId, null, null, null);
    }

    public ProctoringEvidence recordFrameEvidence(
            UUID incidentId,
            String deviceSource,
            byte[] imageBytes,
            UUID procSessionId,
            String testName,
            String studentName,
            String warningName) {

        String url = evidenceStorageService.storeFrame(
                procSessionId, incidentId, deviceSource, imageBytes, testName, studentName, warningName
        );

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

    public ProctoringIncident reviewIncident(UUID incidentId, UUID reviewerId, String action, String notes) {
        ProctoringIncident incident = incidentRepo.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found: " + incidentId));

        incident.setReviewerAction(action);
        incident.setReviewerId(reviewerId);
        incident.setReviewedAt(OffsetDateTime.now());
        incident.setReviewNotes(notes);

        ProctoringIncident saved = incidentRepo.save(incident);

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

