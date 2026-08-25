package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "entity_verifications")
public class EntityVerification {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "entity_id", nullable = false) private UUID entityId;
    @Column(name = "entity_type", nullable = false, length = 30) private String entityType;
    @Column(name = "verification_type", nullable = false, length = 50) private String verificationType;
    @Column(name = "document_url", length = 500) private String documentUrl;
    @Column(nullable = false, length = 30) private String status = "PENDING";
    @Column(name = "verified_by") private UUID verifiedBy;
    @Column(name = "verified_at") private OffsetDateTime verifiedAt;
    @Column(name = "expires_at") private OffsetDateTime expiresAt;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public EntityVerification() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getEntityId() { return entityId; } public void setEntityId(UUID v) { this.entityId = v; }
    public String getEntityType() { return entityType; } public void setEntityType(String v) { this.entityType = v; }
    public String getVerificationType() { return verificationType; } public void setVerificationType(String v) { this.verificationType = v; }
    public String getDocumentUrl() { return documentUrl; } public void setDocumentUrl(String v) { this.documentUrl = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public UUID getVerifiedBy() { return verifiedBy; } public void setVerifiedBy(UUID v) { this.verifiedBy = v; }
    public OffsetDateTime getVerifiedAt() { return verifiedAt; } public void setVerifiedAt(OffsetDateTime v) { this.verifiedAt = v; }
    public OffsetDateTime getExpiresAt() { return expiresAt; } public void setExpiresAt(OffsetDateTime v) { this.expiresAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
