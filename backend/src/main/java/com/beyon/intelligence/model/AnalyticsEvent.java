package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "analytics_events")
public class AnalyticsEvent {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "user_id") private UUID userId;
    @Column(name = "user_role", length = 30) private String userRole;
    @Column(name = "event_type", nullable = false, length = 50) private String eventType;
    @Column(name = "event_data", columnDefinition = "text") private String eventData;
    @Column(length = 500) private String page;
    @Column(name = "session_id", length = 100) private String sessionId;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public AnalyticsEvent() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getUserId() { return userId; } public void setUserId(UUID v) { this.userId = v; }
    public String getUserRole() { return userRole; } public void setUserRole(String v) { this.userRole = v; }
    public String getEventType() { return eventType; } public void setEventType(String v) { this.eventType = v; }
    public String getEventData() { return eventData; } public void setEventData(String v) { this.eventData = v; }
    public String getPage() { return page; } public void setPage(String v) { this.page = v; }
    public String getSessionId() { return sessionId; } public void setSessionId(String v) { this.sessionId = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
