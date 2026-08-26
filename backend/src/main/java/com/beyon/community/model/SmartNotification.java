package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "smart_notifications")
public class SmartNotification {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "notification_type", nullable = false, length = 50) private String notificationType;
    @Column(nullable = false, length = 10) private String priority = "NORMAL";
    @Column(nullable = false, length = 300) private String title;
    @Column(columnDefinition = "text") private String body;
    @Column(name = "action_url", length = 500) private String actionUrl;
    @Column(name = "reference_type", length = 50) private String referenceType;
    @Column(name = "reference_id") private UUID referenceId;
    @Column(name = "is_read", nullable = false) private Boolean isRead = false;
    @Column(name = "delivery_status", nullable = false, length = 20) private String deliveryStatus = "PENDING";
    @Column(name = "delivered_at") private OffsetDateTime deliveredAt;
    @Column(name = "read_at") private OffsetDateTime readAt;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public SmartNotification() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getUserId() { return userId; } public void setUserId(UUID v) { this.userId = v; }
    public String getNotificationType() { return notificationType; } public void setNotificationType(String v) { this.notificationType = v; }
    public String getPriority() { return priority; } public void setPriority(String v) { this.priority = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getBody() { return body; } public void setBody(String v) { this.body = v; }
    public String getActionUrl() { return actionUrl; } public void setActionUrl(String v) { this.actionUrl = v; }
    public String getReferenceType() { return referenceType; } public void setReferenceType(String v) { this.referenceType = v; }
    public UUID getReferenceId() { return referenceId; } public void setReferenceId(UUID v) { this.referenceId = v; }
    public Boolean getIsRead() { return isRead; } public void setIsRead(Boolean v) { this.isRead = v; }
    public String getDeliveryStatus() { return deliveryStatus; } public void setDeliveryStatus(String v) { this.deliveryStatus = v; }
    public OffsetDateTime getDeliveredAt() { return deliveredAt; } public void setDeliveredAt(OffsetDateTime v) { this.deliveredAt = v; }
    public OffsetDateTime getReadAt() { return readAt; } public void setReadAt(OffsetDateTime v) { this.readAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
