package com.beyon.modules.telemetry.service;

import com.beyon.common.aws.AwsEventBridgePublisher;
import com.beyon.modules.telemetry.model.AssessmentAttemptTelemetry;
import com.beyon.modules.telemetry.model.LearningActivityTelemetry;
import com.beyon.modules.telemetry.model.RecommendationFeedbackTelemetry;
import com.beyon.modules.telemetry.repository.AssessmentAttemptTelemetryRepository;
import com.beyon.modules.telemetry.repository.LearningActivityTelemetryRepository;
import com.beyon.modules.telemetry.repository.RecommendationFeedbackTelemetryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class TelemetryService {

    private static final Logger log = LoggerFactory.getLogger(TelemetryService.class);

    private final AssessmentAttemptTelemetryRepository assessmentRepo;
    private final LearningActivityTelemetryRepository activityRepo;
    private final RecommendationFeedbackTelemetryRepository feedbackRepo;
    private final AwsEventBridgePublisher eventBridgePublisher;

    public TelemetryService(
            @Autowired(required = false) AssessmentAttemptTelemetryRepository assessmentRepo,
            @Autowired(required = false) LearningActivityTelemetryRepository activityRepo,
            @Autowired(required = false) RecommendationFeedbackTelemetryRepository feedbackRepo,
            @Autowired(required = false) AwsEventBridgePublisher eventBridgePublisher) {
        this.assessmentRepo = assessmentRepo;
        this.activityRepo = activityRepo;
        this.feedbackRepo = feedbackRepo;
        this.eventBridgePublisher = eventBridgePublisher;
    }

    public void logActivity(String studentId, String actionType, String topicOrSkillId, int durationSeconds, Map<String, Object> metadata) {
        try {
            if (activityRepo != null) {
                LearningActivityTelemetry item = new LearningActivityTelemetry();
                item.setStudentId(studentId);
                item.setActionType(actionType);
                item.setTopicOrSkillId(topicOrSkillId);
                item.setDurationSeconds(durationSeconds);
                item.setMetadata(metadata != null ? metadata : Collections.emptyMap());
                item.setTimestamp(Instant.now());
                activityRepo.save(item);
                log.debug("Logged learning activity: {} for student {}", actionType, studentId);
            }
        } catch (Exception e) {
            log.warn("Failed to persist learning activity to MongoDB: {}", e.getMessage());
        }

        // Emit EventBridge event for asynchronous analytics consumers
        if (eventBridgePublisher != null) {
            try {
                Map<String, Object> event = new HashMap<>();
                event.put("studentId", studentId);
                event.put("actionType", actionType);
                event.put("topicOrSkillId", topicOrSkillId);
                event.put("durationSeconds", durationSeconds);
                event.put("timestamp", Instant.now().toString());
                eventBridgePublisher.publishEvent("LearningActivityRecorded", "com.beyon.telemetry", event);
            } catch (Exception e) {
                log.debug("EventBridge publishing skipped: {}", e.getMessage());
            }
        }
    }

    public void logFeedback(String studentId, String recommendationId, String skillName, String recType, String feedbackAction) {
        try {
            if (feedbackRepo != null) {
                RecommendationFeedbackTelemetry item = new RecommendationFeedbackTelemetry();
                item.setStudentId(studentId);
                item.setRecommendationId(recommendationId);
                item.setSkillName(skillName);
                item.setRecommendationType(recType);
                item.setFeedbackAction(feedbackAction);
                item.setTimestamp(Instant.now());
                feedbackRepo.save(item);
                log.debug("Logged recommendation feedback: {} on {} for student {}", feedbackAction, skillName, studentId);
            }
        } catch (Exception e) {
            log.warn("Failed to persist recommendation feedback to MongoDB: {}", e.getMessage());
        }

        if (eventBridgePublisher != null) {
            try {
                Map<String, Object> event = new HashMap<>();
                event.put("studentId", studentId);
                event.put("recommendationId", recommendationId);
                event.put("skillName", skillName);
                event.put("feedbackAction", feedbackAction);
                event.put("timestamp", Instant.now().toString());
                eventBridgePublisher.publishEvent("RecommendationFeedbackReceived", "com.beyon.telemetry", event);
            } catch (Exception e) {
                log.debug("EventBridge publishing skipped: {}", e.getMessage());
            }
        }
    }

    public void logAssessmentAttempt(AssessmentAttemptTelemetry attempt) {
        try {
            if (assessmentRepo != null) {
                assessmentRepo.save(attempt);
                log.debug("Logged assessment attempt for session {}", attempt.getSessionId());
            }
        } catch (Exception e) {
            log.warn("Failed to persist assessment attempt to MongoDB: {}", e.getMessage());
        }
    }

    public List<LearningActivityTelemetry> getRecentActivity(String studentId) {
        if (activityRepo == null) return Collections.emptyList();
        try {
            return activityRepo.findByStudentIdOrderByTimestampDesc(studentId);
        } catch (Exception e) {
            log.warn("Failed to query learning activity from MongoDB: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
