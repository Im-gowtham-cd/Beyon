package com.beyon.assessment.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "proctoring_events")
public class ProctoringEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(nullable = false, length = 20)
    private String severity;

    @Column(nullable = false, length = 200)
    private String title;

    @Column
    private String description;

    @Column(columnDefinition = "text")
    private String metadata;

    @Column(precision = 3, scale = 2)
    private java.math.BigDecimal confidence;

    @Column(name = "screenshot_url", length = 500)
    private String screenshotUrl;

    @Column(nullable = false)
    private OffsetDateTime timestamp = OffsetDateTime.now();

    public ProctoringEvent() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
    public java.math.BigDecimal getConfidence() { return confidence; }
    public void setConfidence(java.math.BigDecimal confidence) { this.confidence = confidence; }
    public String getScreenshotUrl() { return screenshotUrl; }
    public void setScreenshotUrl(String v) { this.screenshotUrl = v; }
    public OffsetDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }
}
