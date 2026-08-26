package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "notification_type", nullable = false, length = 50) private String notificationType;
    @Column(name = "in_app_enabled", nullable = false) private Boolean inAppEnabled = true;
    @Column(name = "email_enabled", nullable = false) private Boolean emailEnabled = false;
    @Column(name = "push_enabled", nullable = false) private Boolean pushEnabled = false;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public NotificationPreference() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getUserId() { return userId; } public void setUserId(UUID v) { this.userId = v; }
    public String getNotificationType() { return notificationType; } public void setNotificationType(String v) { this.notificationType = v; }
    public Boolean getInAppEnabled() { return inAppEnabled; } public void setInAppEnabled(Boolean v) { this.inAppEnabled = v; }
    public Boolean getEmailEnabled() { return emailEnabled; } public void setEmailEnabled(Boolean v) { this.emailEnabled = v; }
    public Boolean getPushEnabled() { return pushEnabled; } public void setPushEnabled(Boolean v) { this.pushEnabled = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
