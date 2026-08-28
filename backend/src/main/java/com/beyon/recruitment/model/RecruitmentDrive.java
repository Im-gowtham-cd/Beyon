package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "recruitment_drives")
public class RecruitmentDrive {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "company_user_id", nullable = false) private UUID companyUserId;
    @Column(nullable = false, length = 300) private String title;
    @Column(columnDefinition = "text") private String description;
    @Column(name = "job_role", nullable = false, length = 200) private String jobRole;
    @Column(name = "required_skills", columnDefinition = "text") private String requiredSkills;
    @Column(name = "preferred_skills", columnDefinition = "text") private String preferredSkills;
    @Column(name = "min_cgpa", precision = 4, scale = 2) private BigDecimal minCgpa;
    @Column(name = "eligible_departments", columnDefinition = "text") private String eligibleDepartments;
    @Column(name = "eligible_graduation_years", columnDefinition = "text") private String eligibleGraduationYears;
    @Column(name = "salary_range", length = 100) private String salaryRange;
    @Column(length = 200) private String location;
    @Column(name = "work_mode", length = 30) private String workMode = "ONSITE";
    @Column(name = "application_deadline") private OffsetDateTime applicationDeadline;
    @Column(name = "assessment_id") private UUID assessmentId;
    @Column(name = "max_candidates") private Integer maxCandidates = 0;
    @Column(name = "coin_cost") private Integer coinCost = 100;
    @Column(name = "targeting_mode", length = 30) private String targetingMode = "PUBLIC";
    @Column(nullable = false, length = 30) private String status = "DRAFT";
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public RecruitmentDrive() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getCompanyUserId() { return companyUserId; } public void setCompanyUserId(UUID v) { this.companyUserId = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public String getJobRole() { return jobRole; } public void setJobRole(String v) { this.jobRole = v; }
    public String getRequiredSkills() { return requiredSkills; } public void setRequiredSkills(String v) { this.requiredSkills = v; }
    public String getPreferredSkills() { return preferredSkills; } public void setPreferredSkills(String v) { this.preferredSkills = v; }
    public BigDecimal getMinCgpa() { return minCgpa; } public void setMinCgpa(BigDecimal v) { this.minCgpa = v; }
    public String getEligibleDepartments() { return eligibleDepartments; } public void setEligibleDepartments(String v) { this.eligibleDepartments = v; }
    public String getEligibleGraduationYears() { return eligibleGraduationYears; } public void setEligibleGraduationYears(String v) { this.eligibleGraduationYears = v; }
    public String getSalaryRange() { return salaryRange; } public void setSalaryRange(String v) { this.salaryRange = v; }
    public String getLocation() { return location; } public void setLocation(String v) { this.location = v; }
    public String getWorkMode() { return workMode; } public void setWorkMode(String v) { this.workMode = v; }
    public OffsetDateTime getApplicationDeadline() { return applicationDeadline; } public void setApplicationDeadline(OffsetDateTime v) { this.applicationDeadline = v; }
    public UUID getAssessmentId() { return assessmentId; } public void setAssessmentId(UUID v) { this.assessmentId = v; }
    public Integer getMaxCandidates() { return maxCandidates; } public void setMaxCandidates(Integer v) { this.maxCandidates = v; }
    public Integer getCoinCost() { return coinCost; } public void setCoinCost(Integer v) { this.coinCost = v; }
    public String getTargetingMode() { return targetingMode; } public void setTargetingMode(String v) { this.targetingMode = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
