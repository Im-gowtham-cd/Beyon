package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_feedback")
public class UserFeedback {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "feedback_type", nullable = false, length = 30) private String feedbackType;
    @Column(nullable = false, length = 100) private String title;
    @Column(columnDefinition = "text", nullable = false) private String description;
    @Column(length = 50) private String module;
    @Column(length = 20) private String severity = "NORMAL";
    @Column(length = 20) private String status = "OPEN";
    @Column(columnDefinition = "jsonb") private String metadata;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public UserFeedback() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getUserId() { return userId; } public void setUserId(UUID v) { this.userId = v; }
    public String getFeedbackType() { return feedbackType; } public void setFeedbackType(String v) { this.feedbackType = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public String getModule() { return module; } public void setModule(String v) { this.module = v; }
    public String getSeverity() { return severity; } public void setSeverity(String v) { this.severity = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public String getMetadata() { return metadata; } public void setMetadata(String v) { this.metadata = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
