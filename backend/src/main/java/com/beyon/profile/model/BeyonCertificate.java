package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "beyon_certificates")
public class BeyonCertificate {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "certificate_number", nullable = false, unique = true, length = 50) private String certificateNumber;
    @Column(name = "certificate_type", nullable = false, length = 50) private String certificateType;
    @Column(nullable = false, length = 300) private String title;
    @Column(columnDefinition = "text") private String description;
    @Column(name = "skill_name", length = 200) private String skillName;
    @Column(name = "program_id") private UUID programId;
    @Column(name = "assessment_id") private UUID assessmentId;
    @Column(name = "challenge_id") private UUID challengeId;
    @Column(name = "issuer_id") private UUID issuerId;
    @Column(name = "issuer_name", nullable = false, length = 200) private String issuerName;
    @Column(name = "issuer_type", nullable = false, length = 30) private String issuerType = "BEYON";
    @Column private Integer score;
    @Column(name = "skills_covered") private String skillsCovered;
    @Column(name = "issued_at", nullable = false) private OffsetDateTime issuedAt = OffsetDateTime.now();
    @Column(name = "expires_at") private OffsetDateTime expiresAt;
    @Column(name = "verification_url", length = 500) private String verificationUrl;
    @Column(name = "qr_data", columnDefinition = "text") private String qrData;
    @Column(name = "verification_status", nullable = false, length = 30) private String verificationStatus = "VERIFIED";
    @Column(columnDefinition = "text") private String metadata = "{}";
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public BeyonCertificate() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public String getCertificateNumber() { return certificateNumber; } public void setCertificateNumber(String v) { this.certificateNumber = v; }
    public String getCertificateType() { return certificateType; } public void setCertificateType(String v) { this.certificateType = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public String getSkillName() { return skillName; } public void setSkillName(String v) { this.skillName = v; }
    public UUID getProgramId() { return programId; } public void setProgramId(UUID v) { this.programId = v; }
    public UUID getAssessmentId() { return assessmentId; } public void setAssessmentId(UUID v) { this.assessmentId = v; }
    public UUID getChallengeId() { return challengeId; } public void setChallengeId(UUID v) { this.challengeId = v; }
    public UUID getIssuerId() { return issuerId; } public void setIssuerId(UUID v) { this.issuerId = v; }
    public String getIssuerName() { return issuerName; } public void setIssuerName(String v) { this.issuerName = v; }
    public String getIssuerType() { return issuerType; } public void setIssuerType(String v) { this.issuerType = v; }
    public Integer getScore() { return score; } public void setScore(Integer v) { this.score = v; }
    public String getSkillsCovered() { return skillsCovered; } public void setSkillsCovered(String v) { this.skillsCovered = v; }
    public OffsetDateTime getIssuedAt() { return issuedAt; } public void setIssuedAt(OffsetDateTime v) { this.issuedAt = v; }
    public OffsetDateTime getExpiresAt() { return expiresAt; } public void setExpiresAt(OffsetDateTime v) { this.expiresAt = v; }
    public String getVerificationUrl() { return verificationUrl; } public void setVerificationUrl(String v) { this.verificationUrl = v; }
    public String getQrData() { return qrData; } public void setQrData(String v) { this.qrData = v; }
    public String getVerificationStatus() { return verificationStatus; } public void setVerificationStatus(String v) { this.verificationStatus = v; }
    public String getMetadata() { return metadata; } public void setMetadata(String v) { this.metadata = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
