package com.beyon.assessment.service;

import com.beyon.assessment.model.*;
import com.beyon.assessment.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;

/**
 * Manages configurable risk scoring for DualView proctoring sessions.
 * Risk weights and level thresholds are loaded per-opportunity from proctoring_policy_config.
 * Score has decay support: transient signals (gaze, audio) auto-decay after window expires.
 */
@Service
@Transactional
public class RiskScoringService {

    private static final Map<String, Integer> DEFAULT_WEIGHTS = new LinkedHashMap<>();
    static {
        DEFAULT_WEIGHTS.put("SECOND_PERSON", 30);
        DEFAULT_WEIGHTS.put("PHONE_DETECTED", 20);
        DEFAULT_WEIGHTS.put("PHONE_TOWARD_LAPTOP", 25);
        DEFAULT_WEIGHTS.put("PHONE_TOWARD_CANDIDATE", 25);
        DEFAULT_WEIGHTS.put("CANDIDATE_GAZE_TOWARD_HELPER", 15);
        DEFAULT_WEIGHTS.put("SECOND_VOICE", 15);
        DEFAULT_WEIGHTS.put("CONVERSATION_SUSPECTED", 20);
        DEFAULT_WEIGHTS.put("CAMERA_OBSTRUCTION", 30);
        DEFAULT_WEIGHTS.put("CAMERA_REPOSITIONING", 20);
        DEFAULT_WEIGHTS.put("FACE_MISSING", 20);
        DEFAULT_WEIGHTS.put("MULTIPLE_FACES", 35);
        DEFAULT_WEIGHTS.put("POSSIBLE_EXTERNAL_ASSISTANCE", 40);
        DEFAULT_WEIGHTS.put("POSSIBLE_QUESTION_CAPTURE", 35);
        DEFAULT_WEIGHTS.put("MOBILE_DISCONNECTED", 10);
        DEFAULT_WEIGHTS.put("CAMERA_UNAVAILABLE", 15);
    }

    /** Transient events that decay after their window (not permanently scored) */
    private static final Set<String> TRANSIENT_EVENTS = Set.of(
        "FACE_MISSING", "CANDIDATE_GAZE_TOWARD_HELPER", "SECOND_VOICE"
    );

    private final DualViewSessionRepository sessionRepository;
    private final ProctoringRiskScoreRepository riskScoreRepository;
    private final ProctoringPolicyConfigRepository policyConfigRepository;
    private final SseStreamService sseStreamService;
    private final ObjectMapper objectMapper;

    public RiskScoringService(
            DualViewSessionRepository sessionRepository,
            ProctoringRiskScoreRepository riskScoreRepository,
            ProctoringPolicyConfigRepository policyConfigRepository,
            SseStreamService sseStreamService,
            ObjectMapper objectMapper) {
        this.sessionRepository = sessionRepository;
        this.riskScoreRepository = riskScoreRepository;
        this.policyConfigRepository = policyConfigRepository;
        this.sseStreamService = sseStreamService;
        this.objectMapper = objectMapper;
    }

    /**
     * Apply an event to the risk score.
     * @return the new risk score
     */
    public int applyEvent(UUID procSessionId, String eventType) {
        DualViewSession session = sessionRepository.findById(procSessionId)
                .orElseThrow(() -> new RuntimeException("Proctoring session not found: " + procSessionId));

        Map<String, Integer> weights = loadWeights(session);
        int weight = weights.getOrDefault(eventType, 0);
        if (weight == 0) return session.getRiskScore();

        int oldScore = session.getRiskScore();
        int newScore = Math.min(100, oldScore + weight);
        String newLevel = computeLevel(newScore, session);

        session.setRiskScore(newScore);
        session.setRiskLevel(newLevel);
        session.setUpdatedAt(OffsetDateTime.now());

        // Mark review required if SUSPICIOUS or above
        if (!session.getReviewRequired() && newScore >= getThresholdSuspicious(session)) {
            session.setReviewRequired(true);
        }

        sessionRepository.save(session);

        // Append to risk score history
        ProctoringRiskScore entry = new ProctoringRiskScore();
        entry.setProctoringSessionId(procSessionId);
        entry.setScore(newScore);
        entry.setLevel(newLevel);
        entry.setDelta(newScore - oldScore);
        entry.setContributingEvent(eventType);
        riskScoreRepository.save(entry);

        // Push SSE if level changed
        if (!newLevel.equals(session.getRiskLevel()) || newScore != oldScore) {
            sseStreamService.pushRiskLevelChanged(procSessionId.toString(), newScore, newLevel);
        }

        return newScore;
    }

    /**
     * Apply decay to transient risk events. Called periodically.
     */
    public void applyDecay(UUID procSessionId) {
        DualViewSession session = sessionRepository.findById(procSessionId).orElse(null);
        if (session == null) return;

        // Simple decay: reduce by 5 per decay cycle, floor at 0
        int current = session.getRiskScore();
        if (current <= 0) return;

        int decayAmount = 5;
        int decayed = Math.max(0, current - decayAmount);
        String newLevel = computeLevel(decayed, session);

        session.setRiskScore(decayed);
        session.setRiskLevel(newLevel);
        session.setUpdatedAt(OffsetDateTime.now());
        sessionRepository.save(session);

        ProctoringRiskScore entry = new ProctoringRiskScore();
        entry.setProctoringSessionId(procSessionId);
        entry.setScore(decayed);
        entry.setLevel(newLevel);
        entry.setDelta(-decayAmount);
        entry.setContributingEvent("DECAY");
        riskScoreRepository.save(entry);
    }

    public String computeLevel(int score, DualViewSession session) {
        int lc = getThresholdLowConcern(session);
        int sus = getThresholdSuspicious(session);
        int hr = getThresholdHighRisk(session);
        int crit = getThresholdCritical(session);

        if (score >= crit) return "CRITICAL";
        if (score >= hr) return "HIGH_RISK";
        if (score >= sus) return "SUSPICIOUS";
        if (score >= lc) return "LOW_CONCERN";
        return "NORMAL";
    }

    private Map<String, Integer> loadWeights(DualViewSession session) {
        if (session.getOpportunityId() == null) return DEFAULT_WEIGHTS;
        return policyConfigRepository.findByOpportunityId(session.getOpportunityId())
                .map(config -> {
                    try {
                        Map<String, Integer> w = objectMapper.readValue(config.getRiskWeights(),
                                new TypeReference<Map<String, Integer>>() {});
                        Map<String, Integer> merged = new LinkedHashMap<>(DEFAULT_WEIGHTS);
                        merged.putAll(w);
                        return merged;
                    } catch (Exception e) {
                        return DEFAULT_WEIGHTS;
                    }
                })
                .orElse(DEFAULT_WEIGHTS);
    }

    private int getThresholdLowConcern(DualViewSession session) {
        return policyConfigRepository.findByOpportunityId(session.getOpportunityId() != null ? session.getOpportunityId() : UUID.randomUUID())
                .map(ProctoringPolicyConfig::getThresholdLowConcern).orElse(31);
    }
    private int getThresholdSuspicious(DualViewSession session) {
        return policyConfigRepository.findByOpportunityId(session.getOpportunityId() != null ? session.getOpportunityId() : UUID.randomUUID())
                .map(ProctoringPolicyConfig::getThresholdSuspicious).orElse(51);
    }
    private int getThresholdHighRisk(DualViewSession session) {
        return policyConfigRepository.findByOpportunityId(session.getOpportunityId() != null ? session.getOpportunityId() : UUID.randomUUID())
                .map(ProctoringPolicyConfig::getThresholdHighRisk).orElse(71);
    }
    private int getThresholdCritical(DualViewSession session) {
        return policyConfigRepository.findByOpportunityId(session.getOpportunityId() != null ? session.getOpportunityId() : UUID.randomUUID())
                .map(ProctoringPolicyConfig::getThresholdCritical).orElse(86);
    }
}
