package com.beyon.practice.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "company_opportunities")
public class CompanyOpportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "varchar(36)")
    private UUID id;

    @Column(nullable = false)
    private UUID companyUserId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 30)
    private String opportunityType;

    @Column(length = 200)
    private String location;

    @Column(name = "is_remote")
    private Boolean remote;

    @Column(precision = 4, scale = 2)
    private BigDecimal minCgpa;

    @Column(columnDefinition = "TEXT")
    private String eligibleDepartments;

    @Column(columnDefinition = "TEXT")
    private String eligibleGraduationYears;

    @Column(columnDefinition = "TEXT")
    private String requiredSkills;

    @Column(columnDefinition = "TEXT")
    private String preferredSkills;

    @Column(nullable = false)
    private int minBeyonCoins = 0;

    @Column(columnDefinition = "varchar(36)")
    private UUID assessmentId;

    @Column(nullable = false)
    private int applicationCount = 0;

    @Column(nullable = false, length = 20)
    private String status = "DRAFT";

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getCompanyUserId() { return companyUserId; }
    public void setCompanyUserId(UUID companyUserId) { this.companyUserId = companyUserId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getOpportunityType() { return opportunityType; }
    public void setOpportunityType(String opportunityType) { this.opportunityType = opportunityType; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Boolean getRemote() { return remote; }
    public void setRemote(Boolean remote) { this.remote = remote; }
    public BigDecimal getMinCgpa() { return minCgpa; }
    public void setMinCgpa(BigDecimal minCgpa) { this.minCgpa = minCgpa; }
    public String getEligibleDepartments() { return eligibleDepartments; }
    public void setEligibleDepartments(String eligibleDepartments) { this.eligibleDepartments = eligibleDepartments; }
    public String getEligibleGraduationYears() { return eligibleGraduationYears; }
    public void setEligibleGraduationYears(String eligibleGraduationYears) { this.eligibleGraduationYears = eligibleGraduationYears; }
    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }
    public String getPreferredSkills() { return preferredSkills; }
    public void setPreferredSkills(String preferredSkills) { this.preferredSkills = preferredSkills; }
    public int getMinBeyonCoins() { return minBeyonCoins; }
    public void setMinBeyonCoins(int minBeyonCoins) { this.minBeyonCoins = minBeyonCoins; }
    public UUID getAssessmentId() { return assessmentId; }
    public void setAssessmentId(UUID assessmentId) { this.assessmentId = assessmentId; }
    public int getApplicationCount() { return applicationCount; }
    public void setApplicationCount(int applicationCount) { this.applicationCount = applicationCount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
