package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "company_verification_checks")
public class CompanyVerificationCheck {

    @Id
    @Column(columnDefinition = "varchar(36)")
    private String id;

    @Column(nullable = false, columnDefinition = "varchar(36)")
    private String verificationId;

    @Column(nullable = false, length = 50)
    private String checkType; // CIN_FORMAT_CHECK, MCA_CIN_CHECK, COMPANY_STATUS_CHECK, EMAIL_PROVIDER_CHECK, WEBSITE_DOMAIN_CHECK, EMAIL_DOMAIN_CHECK, DOMAIN_MATCH_CHECK

    @Column(nullable = false, length = 20)
    private String status; // PASS, FAIL, SKIPPED, FLAGGED

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public CompanyVerificationCheck() {}

    public CompanyVerificationCheck(String id, String verificationId, String checkType, String status, String details) {
        this.id = id;
        this.verificationId = verificationId;
        this.checkType = checkType;
        this.status = status;
        this.details = details;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getVerificationId() { return verificationId; }
    public void setVerificationId(String verificationId) { this.verificationId = verificationId; }
    public String getCheckType() { return checkType; }
    public void setCheckType(String checkType) { this.checkType = checkType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
