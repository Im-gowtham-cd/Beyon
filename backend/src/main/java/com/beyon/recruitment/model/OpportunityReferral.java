package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "opportunity_referrals")
public class OpportunityReferral {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "referrer_id", nullable = false) private UUID referrerId;
    @Column(name = "opportunity_type", nullable = false, length = 30) private String opportunityType;
    @Column(nullable = false, length = 300) private String title;
    @Column(columnDefinition = "text") private String description;
    @Column(name = "company_name", length = 200) private String companyName;
    @Column(name = "application_url", length = 500) private String applicationUrl;
    @Column(name = "required_skills", columnDefinition = "text") private String requiredSkills;
    @Column(length = 200) private String location;
    @Column(name = "work_mode", length = 30) private String workMode;
    @Column(name = "salary_range", length = 100) private String salaryRange;
    @Column(name = "referral_limit") private Integer referralLimit = 0;
    @Column(name = "referral_count", nullable = false) private Integer referralCount = 0;
    @Column(nullable = false, length = 30) private String status = "ACTIVE";
    @Column(name = "expires_at") private OffsetDateTime expiresAt;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public OpportunityReferral() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getReferrerId() { return referrerId; } public void setReferrerId(UUID v) { this.referrerId = v; }
    public String getOpportunityType() { return opportunityType; } public void setOpportunityType(String v) { this.opportunityType = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public String getCompanyName() { return companyName; } public void setCompanyName(String v) { this.companyName = v; }
    public String getApplicationUrl() { return applicationUrl; } public void setApplicationUrl(String v) { this.applicationUrl = v; }
    public String getRequiredSkills() { return requiredSkills; } public void setRequiredSkills(String v) { this.requiredSkills = v; }
    public String getLocation() { return location; } public void setLocation(String v) { this.location = v; }
    public String getWorkMode() { return workMode; } public void setWorkMode(String v) { this.workMode = v; }
    public String getSalaryRange() { return salaryRange; } public void setSalaryRange(String v) { this.salaryRange = v; }
    public Integer getReferralLimit() { return referralLimit; } public void setReferralLimit(Integer v) { this.referralLimit = v; }
    public Integer getReferralCount() { return referralCount; } public void setReferralCount(Integer v) { this.referralCount = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public OffsetDateTime getExpiresAt() { return expiresAt; } public void setExpiresAt(OffsetDateTime v) { this.expiresAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
