package com.beyon.profile.model;

import com.beyon.profile.enums.CertificationStatus;
import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "student_certifications")
public class StudentCertification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 200)
    private String issuingOrg;

    private LocalDate issueDate;

    private LocalDate expiryDate;

    @Column(length = 100)
    private String credentialId;

    @Column(length = 500)
    private String credentialUrl;

    @Column(length = 500)
    private String certificateUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CertificationStatus status = CertificationStatus.PENDING_VERIFICATION;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIssuingOrg() { return issuingOrg; }
    public void setIssuingOrg(String issuingOrg) { this.issuingOrg = issuingOrg; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public String getCredentialId() { return credentialId; }
    public void setCredentialId(String credentialId) { this.credentialId = credentialId; }
    public String getCredentialUrl() { return credentialUrl; }
    public void setCredentialUrl(String credentialUrl) { this.credentialUrl = credentialUrl; }
    public String getCertificateUrl() { return certificateUrl; }
    public void setCertificateUrl(String certificateUrl) { this.certificateUrl = certificateUrl; }
    public CertificationStatus getStatus() { return status; }
    public void setStatus(CertificationStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
