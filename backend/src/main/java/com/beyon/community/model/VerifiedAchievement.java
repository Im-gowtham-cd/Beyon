package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "verified_achievements")
public class VerifiedAchievement {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "achievement_type", nullable = false, length = 50) private String achievementType;
    @Column(nullable = false, length = 300) private String title;
    @Column(columnDefinition = "text") private String description;
    @Column(name = "issuing_organization", length = 200) private String issuingOrganization;
    @Column(name = "issue_date") private LocalDate issueDate;
    @Column(name = "expiry_date") private LocalDate expiryDate;
    @Column(name = "credential_id", length = 200) private String credentialId;
    @Column(name = "credential_url", length = 500) private String credentialUrl;
    @Column(name = "verification_status", nullable = false, length = 30) private String verificationStatus = "PENDING";
    @Column(name = "verified_by") private UUID verifiedBy;
    @Column(name = "verified_at") private OffsetDateTime verifiedAt;
    @Column(name = "evidence_urls", columnDefinition = "text") private String evidenceUrls = "[]";
    @Column(columnDefinition = "text") private String metadata;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public VerifiedAchievement() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public String getAchievementType() { return achievementType; } public void setAchievementType(String v) { this.achievementType = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public String getIssuingOrganization() { return issuingOrganization; } public void setIssuingOrganization(String v) { this.issuingOrganization = v; }
    public LocalDate getIssueDate() { return issueDate; } public void setIssueDate(LocalDate v) { this.issueDate = v; }
    public LocalDate getExpiryDate() { return expiryDate; } public void setExpiryDate(LocalDate v) { this.expiryDate = v; }
    public String getCredentialId() { return credentialId; } public void setCredentialId(String v) { this.credentialId = v; }
    public String getCredentialUrl() { return credentialUrl; } public void setCredentialUrl(String v) { this.credentialUrl = v; }
    public String getVerificationStatus() { return verificationStatus; } public void setVerificationStatus(String v) { this.verificationStatus = v; }
    public UUID getVerifiedBy() { return verifiedBy; } public void setVerifiedBy(UUID v) { this.verifiedBy = v; }
    public OffsetDateTime getVerifiedAt() { return verifiedAt; } public void setVerifiedAt(OffsetDateTime v) { this.verifiedAt = v; }
    public String getEvidenceUrls() { return evidenceUrls; } public void setEvidenceUrls(String v) { this.evidenceUrls = v; }
    public String getMetadata() { return metadata; } public void setMetadata(String v) { this.metadata = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
