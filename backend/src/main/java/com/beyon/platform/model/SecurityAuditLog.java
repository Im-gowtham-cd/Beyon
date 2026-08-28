package com.beyon.platform.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "security_audit_log")
public class SecurityAuditLog {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "user_id") private UUID userId;
    @Column(nullable = false, length = 100) private String action;
    @Column(name = "resource_type", length = 50) private String resourceType;
    @Column(name = "resource_id") private UUID resourceId;
    @Column(name = "ip_address", length = 45) private String ipAddress;
    @Column(name = "user_agent", columnDefinition = "text") private String userAgent;
    @Column(columnDefinition = "text") private String details;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public SecurityAuditLog() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getUserId() { return userId; } public void setUserId(UUID v) { this.userId = v; }
    public String getAction() { return action; } public void setAction(String v) { this.action = v; }
    public String getResourceType() { return resourceType; } public void setResourceType(String v) { this.resourceType = v; }
    public UUID getResourceId() { return resourceId; } public void setResourceId(UUID v) { this.resourceId = v; }
    public String getIpAddress() { return ipAddress; } public void setIpAddress(String v) { this.ipAddress = v; }
    public String getUserAgent() { return userAgent; } public void setUserAgent(String v) { this.userAgent = v; }
    public String getDetails() { return details; } public void setDetails(String v) { this.details = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
