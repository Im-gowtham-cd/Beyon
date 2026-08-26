package com.beyon.platform.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "consent_records")
public class ConsentRecord {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "consent_type", nullable = false, length = 50) private String consentType;
    @Column(nullable = false) private Boolean granted;
    @Column(name = "ip_address", length = 45) private String ipAddress;
    @Column(name = "user_agent", columnDefinition = "text") private String userAgent;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public ConsentRecord() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getUserId() { return userId; } public void setUserId(UUID v) { this.userId = v; }
    public String getConsentType() { return consentType; } public void setConsentType(String v) { this.consentType = v; }
    public Boolean getGranted() { return granted; } public void setGranted(Boolean v) { this.granted = v; }
    public String getIpAddress() { return ipAddress; } public void setIpAddress(String v) { this.ipAddress = v; }
    public String getUserAgent() { return userAgent; } public void setUserAgent(String v) { this.userAgent = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
