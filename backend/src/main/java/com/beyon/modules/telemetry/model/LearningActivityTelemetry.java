package com.beyon.modules.telemetry.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document(collection = "learning_activity")
public class LearningActivityTelemetry {

    @Id
    private String id;
    private String studentId;
    private String actionType; // TOPIC_VIEW, VIDEO_WATCH, PRACTICE_SPRINT, RECALL_SESSION
    private String topicOrSkillId;
    private int durationSeconds;
    private Instant timestamp;
    private Map<String, Object> metadata;

    public LearningActivityTelemetry() {
        this.timestamp = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getTopicOrSkillId() { return topicOrSkillId; }
    public void setTopicOrSkillId(String topicOrSkillId) { this.topicOrSkillId = topicOrSkillId; }
    public int getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}
