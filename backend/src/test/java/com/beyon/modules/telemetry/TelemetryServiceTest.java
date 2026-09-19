package com.beyon.modules.telemetry;

import com.beyon.common.aws.AwsEventBridgePublisher;
import com.beyon.modules.telemetry.model.AssessmentAttemptTelemetry;
import com.beyon.modules.telemetry.model.LearningActivityTelemetry;
import com.beyon.modules.telemetry.model.RecommendationFeedbackTelemetry;
import com.beyon.modules.telemetry.repository.AssessmentAttemptTelemetryRepository;
import com.beyon.modules.telemetry.repository.LearningActivityTelemetryRepository;
import com.beyon.modules.telemetry.repository.RecommendationFeedbackTelemetryRepository;
import com.beyon.modules.telemetry.service.TelemetryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class TelemetryServiceTest {

    private AssessmentAttemptTelemetryRepository assessmentRepo;
    private LearningActivityTelemetryRepository activityRepo;
    private RecommendationFeedbackTelemetryRepository feedbackRepo;
    private AwsEventBridgePublisher eventBridgePublisher;
    private TelemetryService telemetryService;

    @BeforeEach
    void setUp() {
        assessmentRepo = mock(AssessmentAttemptTelemetryRepository.class);
        activityRepo = mock(LearningActivityTelemetryRepository.class);
        feedbackRepo = mock(RecommendationFeedbackTelemetryRepository.class);
        eventBridgePublisher = mock(AwsEventBridgePublisher.class);

        telemetryService = new TelemetryService(
                assessmentRepo, activityRepo, feedbackRepo, eventBridgePublisher
        );
    }

    @Test
    @DisplayName("Should save learning activity to MongoDB repository and emit EventBridge event")
    void testLogActivity() {
        telemetryService.logActivity("student-123", "PRACTICE_SPRINT", "skill-docker", 45, Map.of("difficulty", "medium"));

        ArgumentCaptor<LearningActivityTelemetry> captor = ArgumentCaptor.forClass(LearningActivityTelemetry.class);
        verify(activityRepo, times(1)).save(captor.capture());

        assertEquals("student-123", captor.getValue().getStudentId());
        assertEquals("PRACTICE_SPRINT", captor.getValue().getActionType());
        assertEquals("skill-docker", captor.getValue().getTopicOrSkillId());
        assertEquals(45, captor.getValue().getDurationSeconds());

        verify(eventBridgePublisher, times(1)).publishEvent(
                eq("LearningActivityRecorded"), eq("com.beyon.telemetry"), anyMap()
        );
    }

    @Test
    @DisplayName("Should record recommendation feedback and emit EventBridge event")
    void testLogFeedback() {
        telemetryService.logFeedback("student-123", "rec-456", "Docker", "COURSE", "ENROLLED");

        ArgumentCaptor<RecommendationFeedbackTelemetry> captor = ArgumentCaptor.forClass(RecommendationFeedbackTelemetry.class);
        verify(feedbackRepo, times(1)).save(captor.capture());

        assertEquals("student-123", captor.getValue().getStudentId());
        assertEquals("rec-456", captor.getValue().getRecommendationId());
        assertEquals("Docker", captor.getValue().getSkillName());
        assertEquals("ENROLLED", captor.getValue().getFeedbackAction());

        verify(eventBridgePublisher, times(1)).publishEvent(
                eq("RecommendationFeedbackReceived"), eq("com.beyon.telemetry"), anyMap()
        );
    }

    @Test
    @DisplayName("Should save assessment attempt telemetry to MongoDB")
    void testLogAssessmentAttempt() {
        AssessmentAttemptTelemetry attempt = new AssessmentAttemptTelemetry();
        attempt.setStudentId("student-123");
        attempt.setSessionId("session-789");
        attempt.setOverallScore(88.5);

        telemetryService.logAssessmentAttempt(attempt);

        verify(assessmentRepo, times(1)).save(attempt);
    }

    @Test
    @DisplayName("Should retrieve recent activity for student")
    void testGetRecentActivity() {
        LearningActivityTelemetry item = new LearningActivityTelemetry();
        item.setStudentId("student-123");
        item.setActionType("TOPIC_VIEW");

        when(activityRepo.findByStudentIdOrderByTimestampDesc("student-123"))
                .thenReturn(List.of(item));

        List<LearningActivityTelemetry> result = telemetryService.getRecentActivity("student-123");
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("TOPIC_VIEW", result.get(0).getActionType());
    }
}
