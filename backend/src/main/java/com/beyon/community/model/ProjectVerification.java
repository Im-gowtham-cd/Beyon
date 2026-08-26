package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_verifications")
public class ProjectVerification {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "project_id", nullable = false) private UUID projectId;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "verification_type", nullable = false, length = 50) private String verificationType;
    @Column(name = "evidence_url", length = 500) private String evidenceUrl;
    @Column(name = "verifier_id") private UUID verifierId;
    @Column(nullable = false, length = 30) private String status = "PENDING";
    @Column(name = "verified_at") private OffsetDateTime verifiedAt;
    @Column(name = "expires_at") private OffsetDateTime expiresAt;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public ProjectVerification() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getProjectId() { return projectId; } public void setProjectId(UUID v) { this.projectId = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public String getVerificationType() { return verificationType; } public void setVerificationType(String v) { this.verificationType = v; }
    public String getEvidenceUrl() { return evidenceUrl; } public void setEvidenceUrl(String v) { this.evidenceUrl = v; }
    public UUID getVerifierId() { return verifierId; } public void setVerifierId(UUID v) { this.verifierId = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public OffsetDateTime getVerifiedAt() { return verifiedAt; } public void setVerifiedAt(OffsetDateTime v) { this.verifiedAt = v; }
    public OffsetDateTime getExpiresAt() { return expiresAt; } public void setExpiresAt(OffsetDateTime v) { this.expiresAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
