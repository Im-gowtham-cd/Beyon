package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "portfolio_verifications")
public class PortfolioVerification {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "project_id", nullable = false) private UUID projectId;
    @Column(name = "verifier_id", nullable = false) private UUID verifierId;
    @Column(name = "verifier_type", nullable = false, length = 50) private String verifierType;
    @Column(name = "verification_status", nullable = false, length = 30) private String verificationStatus = "PENDING";
    @Column(name = "evidence_url", length = 500) private String evidenceUrl;
    @Column(name = "evidence_description", columnDefinition = "text") private String evidenceDescription;
    @Column(name = "verified_at") private OffsetDateTime verifiedAt;
    @Column(name = "expires_at") private OffsetDateTime expiresAt;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public PortfolioVerification() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getProjectId() { return projectId; } public void setProjectId(UUID v) { this.projectId = v; }
    public UUID getVerifierId() { return verifierId; } public void setVerifierId(UUID v) { this.verifierId = v; }
    public String getVerifierType() { return verifierType; } public void setVerifierType(String v) { this.verifierType = v; }
    public String getVerificationStatus() { return verificationStatus; } public void setVerificationStatus(String v) { this.verificationStatus = v; }
    public String getEvidenceUrl() { return evidenceUrl; } public void setEvidenceUrl(String v) { this.evidenceUrl = v; }
    public String getEvidenceDescription() { return evidenceDescription; } public void setEvidenceDescription(String v) { this.evidenceDescription = v; }
    public OffsetDateTime getVerifiedAt() { return verifiedAt; } public void setVerifiedAt(OffsetDateTime v) { this.verifiedAt = v; }
    public OffsetDateTime getExpiresAt() { return expiresAt; } public void setExpiresAt(OffsetDateTime v) { this.expiresAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
