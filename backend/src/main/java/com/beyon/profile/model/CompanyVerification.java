package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "company_verifications")
public class CompanyVerification {

    @Id
    @Column(columnDefinition = "varchar(36)")
    private String id;

    @Column(nullable = false, columnDefinition = "varchar(36)")
    private String companyId;

    @Column(nullable = false, columnDefinition = "varchar(36)")
    private String userId;

    @Column(nullable = false, length = 21)
    private String cin;

    @Column(nullable = false, length = 255)
    private String legalName;

    @Column(nullable = false, length = 50)
    private String companyStatus;

    @Column(nullable = false, length = 500)
    private String officialWebsite;

    @Column(nullable = false, length = 255)
    private String normalizedWebsiteDomain;

    @Column(nullable = false, length = 255)
    private String corporateEmail;

    @Column(nullable = false, length = 255)
    private String normalizedEmailDomain;

    @Column(nullable = false, length = 200)
    private String representativeName;

    @Column(length = 100)
    private String representativeDesignation;

    @Column(length = 50)
    private String representativePhone;

    @Column(nullable = false, length = 50)
    private String overallStatus; // PENDING, CIN_INVALID, CIN_NOT_FOUND, COMPANY_INACTIVE, PUBLIC_EMAIL, DOMAIN_MISMATCH, MANUAL_REVIEW, VERIFIED, REJECTED, SUSPENDED

    @Column(columnDefinition = "TEXT")
    private String failureReasons;

    @Column(columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(columnDefinition = "varchar(36)")
    private String reviewedBy;

    private Instant reviewedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public CompanyVerification() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }
    public String getLegalName() { return legalName; }
    public void setLegalName(String legalName) { this.legalName = legalName; }
    public String getCompanyStatus() { return companyStatus; }
    public void setCompanyStatus(String companyStatus) { this.companyStatus = companyStatus; }
    public String getOfficialWebsite() { return officialWebsite; }
    public void setOfficialWebsite(String officialWebsite) { this.officialWebsite = officialWebsite; }
    public String getNormalizedWebsiteDomain() { return normalizedWebsiteDomain; }
    public void setNormalizedWebsiteDomain(String normalizedWebsiteDomain) { this.normalizedWebsiteDomain = normalizedWebsiteDomain; }
    public String getCorporateEmail() { return corporateEmail; }
    public void setCorporateEmail(String corporateEmail) { this.corporateEmail = corporateEmail; }
    public String getNormalizedEmailDomain() { return normalizedEmailDomain; }
    public void setNormalizedEmailDomain(String normalizedEmailDomain) { this.normalizedEmailDomain = normalizedEmailDomain; }
    public String getRepresentativeName() { return representativeName; }
    public void setRepresentativeName(String representativeName) { this.representativeName = representativeName; }
    public String getRepresentativeDesignation() { return representativeDesignation; }
    public void setRepresentativeDesignation(String representativeDesignation) { this.representativeDesignation = representativeDesignation; }
    public String getRepresentativePhone() { return representativePhone; }
    public void setRepresentativePhone(String representativePhone) { this.representativePhone = representativePhone; }
    public String getOverallStatus() { return overallStatus; }
    public void setOverallStatus(String overallStatus) { this.overallStatus = overallStatus; }
    public String getFailureReasons() { return failureReasons; }
    public void setFailureReasons(String failureReasons) { this.failureReasons = failureReasons; }
    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }
    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
