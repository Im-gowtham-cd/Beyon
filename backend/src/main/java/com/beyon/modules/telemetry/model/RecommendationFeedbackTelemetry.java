package com.beyon.modules.telemetry.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "recommendation_feedback")
public class RecommendationFeedbackTelemetry {

    @Id
    private String id;
    private String studentId;
    private String recommendationId;
    private String skillName;
    private String recommendationType; // COURSE, QUESTION_SPRINT, PROJECT
    private String feedbackAction; // CLICKED, DISMISSED, ENROLLED, COMPLETED
    private Instant timestamp;

    public RecommendationFeedbackTelemetry() {
        this.timestamp = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getRecommendationId() { return recommendationId; }
    public void setRecommendationId(String recommendationId) { this.recommendationId = recommendationId; }
    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }
    public String getRecommendationType() { return recommendationType; }
    public void setRecommendationType(String recommendationType) { this.recommendationType = recommendationType; }
    public String getFeedbackAction() { return feedbackAction; }
    public void setFeedbackAction(String feedbackAction) { this.feedbackAction = feedbackAction; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
