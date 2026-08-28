package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "placement_verifications")
public class PlacementVerification {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "placement_record_id", nullable = false) private UUID placementRecordId;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "company_user_id", nullable = false) private UUID companyUserId;
    @Column(name = "institution_id") private UUID institutionId;
    @Column(name = "verification_status", nullable = false, length = 30) private String verificationStatus = "PENDING";
    @Column(name = "verified_by") private UUID verifiedBy;
    @Column(name = "verified_at") private OffsetDateTime verifiedAt;
    @Column(name = "verification_source", length = 50) private String verificationSource;
    @Column(name = "verification_document_url", length = 500) private String verificationDocumentUrl;
    @Column(name = "rejection_reason", columnDefinition = "text") private String rejectionReason;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public PlacementVerification() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getPlacementRecordId() { return placementRecordId; } public void setPlacementRecordId(UUID v) { this.placementRecordId = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getCompanyUserId() { return companyUserId; } public void setCompanyUserId(UUID v) { this.companyUserId = v; }
    public UUID getInstitutionId() { return institutionId; } public void setInstitutionId(UUID v) { this.institutionId = v; }
    public String getVerificationStatus() { return verificationStatus; } public void setVerificationStatus(String v) { this.verificationStatus = v; }
    public UUID getVerifiedBy() { return verifiedBy; } public void setVerifiedBy(UUID v) { this.verifiedBy = v; }
    public OffsetDateTime getVerifiedAt() { return verifiedAt; } public void setVerifiedAt(OffsetDateTime v) { this.verifiedAt = v; }
    public String getVerificationSource() { return verificationSource; } public void setVerificationSource(String v) { this.verificationSource = v; }
    public String getVerificationDocumentUrl() { return verificationDocumentUrl; } public void setVerificationDocumentUrl(String v) { this.verificationDocumentUrl = v; }
    public String getRejectionReason() { return rejectionReason; } public void setRejectionReason(String v) { this.rejectionReason = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
