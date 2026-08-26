package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "company_tier_profiles")
public class CompanyTierProfile {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "company_user_id", nullable = false, unique = true) private UUID companyUserId;
    @Column(nullable = false, length = 20) private String tier = "STARTUP";
    @Column(name = "average_package", precision = 12, scale = 2) private BigDecimal averagePackage;
    @Column(name = "hiring_count", nullable = false) private Integer hiringCount = 0;
    @Column(name = "student_rating", precision = 3, scale = 2) private BigDecimal studentRating = BigDecimal.ZERO;
    @Column(name = "assessment_rating", precision = 3, scale = 2) private BigDecimal assessmentRating = BigDecimal.ZERO;
    @Column(name = "active_opportunities", nullable = false) private Integer activeOpportunities = 0;
    @Column(name = "compensation_score", precision = 3, scale = 2) private BigDecimal compensationScore = BigDecimal.ZERO;
    @Column(name = "reputation_score", precision = 3, scale = 2) private BigDecimal reputationScore = BigDecimal.ZERO;
    @Column(name = "retention_score", precision = 3, scale = 2) private BigDecimal retentionScore = BigDecimal.ZERO;
    @Column(name = "calculation_version", nullable = false) private Integer calculationVersion = 1;
    @Column(name = "last_calculated_at", nullable = false) private OffsetDateTime lastCalculatedAt = OffsetDateTime.now();
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public CompanyTierProfile() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getCompanyUserId() { return companyUserId; } public void setCompanyUserId(UUID v) { this.companyUserId = v; }
    public String getTier() { return tier; } public void setTier(String v) { this.tier = v; }
    public BigDecimal getAveragePackage() { return averagePackage; } public void setAveragePackage(BigDecimal v) { this.averagePackage = v; }
    public Integer getHiringCount() { return hiringCount; } public void setHiringCount(Integer v) { this.hiringCount = v; }
    public BigDecimal getStudentRating() { return studentRating; } public void setStudentRating(BigDecimal v) { this.studentRating = v; }
    public BigDecimal getAssessmentRating() { return assessmentRating; } public void setAssessmentRating(BigDecimal v) { this.assessmentRating = v; }
    public Integer getActiveOpportunities() { return activeOpportunities; } public void setActiveOpportunities(Integer v) { this.activeOpportunities = v; }
    public BigDecimal getCompensationScore() { return compensationScore; } public void setCompensationScore(BigDecimal v) { this.compensationScore = v; }
    public BigDecimal getReputationScore() { return reputationScore; } public void setReputationScore(BigDecimal v) { this.reputationScore = v; }
    public BigDecimal getRetentionScore() { return retentionScore; } public void setRetentionScore(BigDecimal v) { this.retentionScore = v; }
    public Integer getCalculationVersion() { return calculationVersion; } public void setCalculationVersion(Integer v) { this.calculationVersion = v; }
    public OffsetDateTime getLastCalculatedAt() { return lastCalculatedAt; } public void setLastCalculatedAt(OffsetDateTime v) { this.lastCalculatedAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
