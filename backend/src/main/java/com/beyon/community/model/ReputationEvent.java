package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "reputation_events")
public class ReputationEvent {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "event_type", nullable = false, length = 50) private String eventType;
    @Column(nullable = false) private Integer points;
    @Column(name = "reference_type", length = 50) private String referenceType;
    @Column(name = "reference_id") private UUID referenceId;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public ReputationEvent() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getUserId() { return userId; } public void setUserId(UUID v) { this.userId = v; }
    public String getEventType() { return eventType; } public void setEventType(String v) { this.eventType = v; }
    public Integer getPoints() { return points; } public void setPoints(Integer v) { this.points = v; }
    public String getReferenceType() { return referenceType; } public void setReferenceType(String v) { this.referenceType = v; }
    public UUID getReferenceId() { return referenceId; } public void setReferenceId(UUID v) { this.referenceId = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
