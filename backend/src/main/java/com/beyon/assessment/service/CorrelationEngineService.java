package com.beyon.assessment.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CorrelationEngineService {

    private static final Logger log = LoggerFactory.getLogger(CorrelationEngineService.class);

    private static final long SIGNAL_WINDOW_MS = 30_000;

    private final ConcurrentHashMap<String, Map<String, List<SignalObservation>>> sessionSignals
            = new ConcurrentHashMap<>();

    private final ConcurrentHashMap<String, Map<String, Long>> recentIncidents
            = new ConcurrentHashMap<>();

    private static final long INCIDENT_COOLDOWN_MS = 60_000;

    private final IncidentService incidentService;
    private final DualViewProctoringService dvService;

    public CorrelationEngineService(IncidentService incidentService, DualViewProctoringService dvService) {
        this.incidentService = incidentService;
        this.dvService = dvService;
    }

    public void recordSignal(String procSessionId, String eventType, String source,
                              double confidence, String questionId) {
        sessionSignals.computeIfAbsent(procSessionId, k -> new ConcurrentHashMap<>())
                .computeIfAbsent(eventType, k -> Collections.synchronizedList(new ArrayList<>()))
                .add(new SignalObservation(eventType, source, confidence, questionId, System.currentTimeMillis()));
    }

    @Scheduled(fixedDelay = 5000)
    public void runCorrelation() {
        sessionSignals.forEach((procSessionId, signals) -> {
            try {
                pruneOldSignals(signals);
                runScenarios(procSessionId, signals);
            } catch (Exception e) {
                log.error("Correlation error for session {}: {}", procSessionId, e.getMessage());
            }
        });
    }

    private void runScenarios(String procSessionId, Map<String, List<SignalObservation>> signals) {
        UUID id;
        try { id = UUID.fromString(procSessionId); } catch (Exception e) { return; }

        boolean hasSecondPerson  = hasSignal(signals, "SECOND_PERSON");
        boolean hasPhone         = hasSignal(signals, "PHONE_DETECTED");
        boolean hasPhoneToward   = hasSignal(signals, "PHONE_TOWARD_LAPTOP");
        boolean hasGazeToHelper  = hasSignal(signals, "CANDIDATE_GAZE_TOWARD_HELPER");
        boolean hasSecondVoice   = hasSignal(signals, "SECOND_VOICE");
        boolean hasConversation  = hasSignal(signals, "CONVERSATION_SUSPECTED");
        boolean hasFaceMissing   = hasSignal(signals, "FACE_MISSING");
        boolean hasCameraCovered = hasSignal(signals, "CAMERA_COVERED");
        boolean hasCameraRepos   = hasSignal(signals, "CAMERA_REPOSITIONED");

        if (hasSecondPerson && (hasPhone || hasPhoneToward) && hasGazeToHelper) {
            int signalCount = countSignals(hasSecondPerson, hasPhone || hasPhoneToward, hasGazeToHelper);
            double confidence = computeConfidence(signals, "SECOND_PERSON", "PHONE_DETECTED", "CANDIDATE_GAZE_TOWARD_HELPER");
            String questionId = getMostRecentQuestion(signals);
            createIncidentIfNotCooldown(id, "POSSIBLE_EXTERNAL_ASSISTANCE", "HIGH",
                confidence, 40, questionId,
                buildSources(signals, "SECOND_PERSON", "PHONE_DETECTED", "CANDIDATE_GAZE_TOWARD_HELPER"),
                signalCount);
        }

        else if (hasPhone && hasPhoneToward) {
            String questionId = getMostRecentQuestion(signals);
            if (questionId != null) {
                int signalCount = countSignals(hasPhone, hasPhoneToward);
                double confidence = computeConfidence(signals, "PHONE_DETECTED", "PHONE_TOWARD_LAPTOP");
                createIncidentIfNotCooldown(id, "POSSIBLE_QUESTION_CAPTURE", "HIGH",
                    confidence, 35, questionId,
                    buildSources(signals, "PHONE_DETECTED", "PHONE_TOWARD_LAPTOP"),
                    signalCount);
            }
        }

        if (hasSecondVoice && (hasSecondPerson || hasConversation)) {
            int signalCount = countSignals(hasSecondVoice, hasSecondPerson || hasConversation);
            double confidence = computeConfidence(signals, "SECOND_VOICE", "SECOND_PERSON");
            String questionId = getMostRecentQuestion(signals);
            createIncidentIfNotCooldown(id, "AUDIO_CONVERSATION", "MEDIUM",
                confidence, 25, questionId,
                buildSources(signals, "SECOND_VOICE", "SECOND_PERSON"),
                signalCount);
        }

        if (hasCameraCovered) {
            createIncidentIfNotCooldown(id, "CAMERA_TAMPERING", "CRITICAL",
                0.95, 30, null, List.of("LAPTOP_CAMERA"), 1);
        }
        if (hasCameraRepos) {
            createIncidentIfNotCooldown(id, "CAMERA_REPOSITIONING", "MEDIUM",
                0.90, 20, null, List.of("MOBILE_CAMERA", "LAPTOP_CAMERA"), 1);
        }

        if (hasFaceMissing) {
            long absenceDurationMs = getSignalDuration(signals, "FACE_MISSING");
            if (absenceDurationMs > 8000) {
                createIncidentIfNotCooldown(id, "SUSTAINED_ABSENCE", "HIGH",
                    0.85, 20, getMostRecentQuestion(signals), List.of("LAPTOP_CAMERA"), 1);
            }
        }
    }

    private boolean hasSignal(Map<String, List<SignalObservation>> signals, String eventType) {
        List<SignalObservation> obs = signals.get(eventType);
        return obs != null && !obs.isEmpty();
    }

    private int countSignals(boolean... flags) {
        int count = 0;
        for (boolean f : flags) if (f) count++;
        return count;
    }

    private double computeConfidence(Map<String, List<SignalObservation>> signals, String... eventTypes) {
        double total = 0;
        int count = 0;
        for (String et : eventTypes) {
            List<SignalObservation> obs = signals.get(et);
            if (obs != null && !obs.isEmpty()) {
                total += obs.stream().mapToDouble(o -> o.confidence).average().orElse(0.7);
                count++;
            }
        }
        return count > 0 ? Math.min(1.0, total / count) : 0.7;
    }

    private List<String> buildSources(Map<String, List<SignalObservation>> signals, String... eventTypes) {
        Set<String> sources = new LinkedHashSet<>();
        for (String et : eventTypes) {
            List<SignalObservation> obs = signals.get(et);
            if (obs != null) obs.forEach(o -> sources.add(o.source));
        }
        return new ArrayList<>(sources);
    }

    private String getMostRecentQuestion(Map<String, List<SignalObservation>> signals) {
        return signals.values().stream()
                .flatMap(List::stream)
                .filter(o -> o.questionId != null)
                .max(Comparator.comparingLong(o -> o.timestamp))
                .map(o -> o.questionId)
                .orElse(null);
    }

    private long getSignalDuration(Map<String, List<SignalObservation>> signals, String eventType) {
        List<SignalObservation> obs = signals.get(eventType);
        if (obs == null || obs.isEmpty()) return 0;
        long earliest = obs.stream().mapToLong(o -> o.timestamp).min().orElse(System.currentTimeMillis());
        return System.currentTimeMillis() - earliest;
    }

    private void createIncidentIfNotCooldown(
            UUID procSessionId, String incidentType, String severity,
            double confidence, int riskContribution, String questionId,
            List<String> sources, int signalCount) {

        String cooldownKey = procSessionId + ":" + incidentType;
        Long lastCreated = recentIncidents
                .computeIfAbsent(procSessionId.toString(), k -> new ConcurrentHashMap<>())
                .get(incidentType);

        if (lastCreated != null && System.currentTimeMillis() - lastCreated < INCIDENT_COOLDOWN_MS) {
            return;
        }

        try {
            incidentService.createIncident(procSessionId, incidentType, severity,
                confidence, riskContribution, questionId, sources, signalCount);

            recentIncidents.computeIfAbsent(procSessionId.toString(), k -> new ConcurrentHashMap<>())
                    .put(incidentType, System.currentTimeMillis());

            log.info("[Correlation] Incident created: {} | session={} | signals={} | confidence={}",
                incidentType, procSessionId, signalCount, confidence);
        } catch (Exception e) {
            log.error("Failed to create incident {}: {}", incidentType, e.getMessage());
        }
    }

    private void pruneOldSignals(Map<String, List<SignalObservation>> signals) {
        long cutoff = System.currentTimeMillis() - SIGNAL_WINDOW_MS;
        signals.values().forEach(list ->
            list.removeIf(obs -> obs.timestamp < cutoff));
    }

    public void clearSession(String procSessionId) {
        sessionSignals.remove(procSessionId);
        recentIncidents.remove(procSessionId);
    }

    private static class SignalObservation {
        final String eventType;
        final String source;
        final double confidence;
        final String questionId;
        final long timestamp;

        SignalObservation(String eventType, String source, double confidence,
                         String questionId, long timestamp) {
            this.eventType = eventType;
            this.source = source;
            this.confidence = confidence;
            this.questionId = questionId;
            this.timestamp = timestamp;
        }
    }
}

