package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "company_requirements")
public class CompanyRequirement {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "opportunity_id", nullable = false) private UUID opportunityId;
    @Column(name = "company_id", nullable = false) private UUID companyId;
    @Column(nullable = false, length = 300) private String title;
    @Column(columnDefinition = "text") private String description;
    @Column(name = "required_skills", columnDefinition = "jsonb", nullable = false) private String requiredSkills = "[]";
    @Column(name = "preferred_skills", columnDefinition = "jsonb", nullable = false) private String preferredSkills = "[]";
    @Column(name = "min_cgpa", precision = 4, scale = 2) private BigDecimal minCgpa;
    @Column(name = "min_experience_years") private Integer minExperienceYears = 0;
    @Column(name = "department_filter", columnDefinition = "jsonb") private String departmentFilter;
    @Column(name = "graduation_year_filter", columnDefinition = "jsonb") private String graduationYearFilter;
    @Column(name = "assessment_id") private UUID assessmentId;
    @Column(name = "coin_cost", nullable = false) private Integer coinCost = 0;
    @Column(nullable = false, length = 20) private String status = "DRAFT";
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public CompanyRequirement() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getOpportunityId() { return opportunityId; } public void setOpportunityId(UUID v) { this.opportunityId = v; }
    public UUID getCompanyId() { return companyId; } public void setCompanyId(UUID v) { this.companyId = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public String getRequiredSkills() { return requiredSkills; } public void setRequiredSkills(String v) { this.requiredSkills = v; }
    public String getPreferredSkills() { return preferredSkills; } public void setPreferredSkills(String v) { this.preferredSkills = v; }
    public BigDecimal getMinCgpa() { return minCgpa; } public void setMinCgpa(BigDecimal v) { this.minCgpa = v; }
    public Integer getMinExperienceYears() { return minExperienceYears; } public void setMinExperienceYears(Integer v) { this.minExperienceYears = v; }
    public String getDepartmentFilter() { return departmentFilter; } public void setDepartmentFilter(String v) { this.departmentFilter = v; }
    public String getGraduationYearFilter() { return graduationYearFilter; } public void setGraduationYearFilter(String v) { this.graduationYearFilter = v; }
    public UUID getAssessmentId() { return assessmentId; } public void setAssessmentId(UUID v) { this.assessmentId = v; }
    public Integer getCoinCost() { return coinCost; } public void setCoinCost(Integer v) { this.coinCost = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
