package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "institution_ratings")
public class InstitutionRating {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "institution_id", nullable = false, unique = true) private UUID institutionId;
    @Column(name = "academic_score", nullable = false, precision = 3, scale = 2) private BigDecimal academicScore = BigDecimal.ZERO;
    @Column(name = "placement_score", nullable = false, precision = 3, scale = 2) private BigDecimal placementScore = BigDecimal.ZERO;
    @Column(name = "salary_score", nullable = false, precision = 3, scale = 2) private BigDecimal salaryScore = BigDecimal.ZERO;
    @Column(name = "industry_score", nullable = false, precision = 3, scale = 2) private BigDecimal industryScore = BigDecimal.ZERO;
    @Column(name = "skill_score", nullable = false, precision = 3, scale = 2) private BigDecimal skillScore = BigDecimal.ZERO;
    @Column(name = "overall_rating", nullable = false, precision = 3, scale = 2) private BigDecimal overallRating = BigDecimal.ZERO;
    @Column(name = "calculation_version", nullable = false) private Integer calculationVersion = 1;
    @Column(name = "last_calculated_at", nullable = false) private OffsetDateTime lastCalculatedAt = OffsetDateTime.now();
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public InstitutionRating() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getInstitutionId() { return institutionId; } public void setInstitutionId(UUID v) { this.institutionId = v; }
    public BigDecimal getAcademicScore() { return academicScore; } public void setAcademicScore(BigDecimal v) { this.academicScore = v; }
    public BigDecimal getPlacementScore() { return placementScore; } public void setPlacementScore(BigDecimal v) { this.placementScore = v; }
    public BigDecimal getSalaryScore() { return salaryScore; } public void setSalaryScore(BigDecimal v) { this.salaryScore = v; }
    public BigDecimal getIndustryScore() { return industryScore; } public void setIndustryScore(BigDecimal v) { this.industryScore = v; }
    public BigDecimal getSkillScore() { return skillScore; } public void setSkillScore(BigDecimal v) { this.skillScore = v; }
    public BigDecimal getOverallRating() { return overallRating; } public void setOverallRating(BigDecimal v) { this.overallRating = v; }
    public Integer getCalculationVersion() { return calculationVersion; } public void setCalculationVersion(Integer v) { this.calculationVersion = v; }
    public OffsetDateTime getLastCalculatedAt() { return lastCalculatedAt; } public void setLastCalculatedAt(OffsetDateTime v) { this.lastCalculatedAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
