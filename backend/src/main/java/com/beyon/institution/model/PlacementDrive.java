package com.beyon.institution.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "placement_drives")
public class PlacementDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "varchar(36)")
    private UUID id;

    @Column(nullable = false)
    private UUID opportunityId;

    @Column(nullable = false)
    private UUID institutionId;

    @Column(nullable = false)
    private UUID companyUserId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 30)
    private String status = "PENDING";

    private int eligibleStudentCount;

    private int appliedCount;

    private int assessedCount;

    private int shortlistedCount;

    private int interviewedCount;

    private int selectedCount;

    private LocalDate driveDate;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getOpportunityId() { return opportunityId; }
    public void setOpportunityId(UUID opportunityId) { this.opportunityId = opportunityId; }
    public UUID getInstitutionId() { return institutionId; }
    public void setInstitutionId(UUID institutionId) { this.institutionId = institutionId; }
    public UUID getCompanyUserId() { return companyUserId; }
    public void setCompanyUserId(UUID companyUserId) { this.companyUserId = companyUserId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getEligibleStudentCount() { return eligibleStudentCount; }
    public void setEligibleStudentCount(int eligibleStudentCount) { this.eligibleStudentCount = eligibleStudentCount; }
    public int getAppliedCount() { return appliedCount; }
    public void setAppliedCount(int appliedCount) { this.appliedCount = appliedCount; }
    public int getApplicantCount() { return appliedCount; }
    public void setApplicantCount(int applicantCount) { this.appliedCount = applicantCount; }
    public int getAssessedCount() { return assessedCount; }
    public void setAssessedCount(int assessedCount) { this.assessedCount = assessedCount; }
    public int getShortlistedCount() { return shortlistedCount; }
    public void setShortlistedCount(int shortlistedCount) { this.shortlistedCount = shortlistedCount; }
    public int getInterviewedCount() { return interviewedCount; }
    public void setInterviewedCount(int interviewedCount) { this.interviewedCount = interviewedCount; }
    public int getSelectedCount() { return selectedCount; }
    public void setSelectedCount(int selectedCount) { this.selectedCount = selectedCount; }
    public LocalDate getDriveDate() { return driveDate; }
    public void setDriveDate(LocalDate driveDate) { this.driveDate = driveDate; }

    @Transient
    private String companyName;

    @Transient
    private String role;

    @Transient
    private String driveType = "ON_CAMPUS";

    @Column(precision = 6, scale = 2)
    private java.math.BigDecimal packageLpa = java.math.BigDecimal.valueOf(12.0);

    @Transient
    private String eligibleBatch = "2026";

    @Transient
    private String eligibleDepts = "All Streams";

    @Transient
    private java.math.BigDecimal minCgpa = java.math.BigDecimal.valueOf(7.0);

    @Transient
    private String location = "Campus / Hybrid";

    @Transient
    private String interviewDate = "Scheduled on Confirmation";

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getRole() { return role != null ? role : title; }
    public void setRole(String role) { this.role = role; }

    public String getDriveType() { return driveType; }
    public void setDriveType(String driveType) { this.driveType = driveType; }

    public java.math.BigDecimal getPackageLpa() { return packageLpa; }
    public void setPackageLpa(java.math.BigDecimal packageLpa) { this.packageLpa = packageLpa; }

    public String getEligibleBatch() { return eligibleBatch; }
    public void setEligibleBatch(String eligibleBatch) { this.eligibleBatch = eligibleBatch; }

    public String getEligibleDepts() { return eligibleDepts; }
    public void setEligibleDepts(String eligibleDepts) { this.eligibleDepts = eligibleDepts; }

    public java.math.BigDecimal getMinCgpa() { return minCgpa; }
    public void setMinCgpa(java.math.BigDecimal minCgpa) { this.minCgpa = minCgpa; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getInterviewDate() { return interviewDate; }
    public void setInterviewDate(String interviewDate) { this.interviewDate = interviewDate; }
}

