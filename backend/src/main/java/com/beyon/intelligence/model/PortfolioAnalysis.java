package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "portfolio_analysis")
public class PortfolioAnalysis {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "overall_score", nullable = false, precision = 5, scale = 2) private BigDecimal overallScore = BigDecimal.ZERO;
    @Column(nullable = false, precision = 5, scale = 2) private BigDecimal completeness = BigDecimal.ZERO;
    @Column(name = "skill_coverage", nullable = false, precision = 5, scale = 2) private BigDecimal skillCoverage = BigDecimal.ZERO;
    @Column(name = "project_strength", nullable = false, precision = 5, scale = 2) private BigDecimal projectStrength = BigDecimal.ZERO;
    @Column(name = "certification_strength", nullable = false, precision = 5, scale = 2) private BigDecimal certificationStrength = BigDecimal.ZERO;
    @Column(nullable = false, columnDefinition = "text") private String recommendations = "[]";
    @Column(name = "missing_items", nullable = false, columnDefinition = "text") private String missingItems = "[]";
    @Column(name = "analyzed_at", nullable = false) private OffsetDateTime analyzedAt = OffsetDateTime.now();
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public PortfolioAnalysis() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public BigDecimal getOverallScore() { return overallScore; } public void setOverallScore(BigDecimal v) { this.overallScore = v; }
    public BigDecimal getCompleteness() { return completeness; } public void setCompleteness(BigDecimal v) { this.completeness = v; }
    public BigDecimal getSkillCoverage() { return skillCoverage; } public void setSkillCoverage(BigDecimal v) { this.skillCoverage = v; }
    public BigDecimal getProjectStrength() { return projectStrength; } public void setProjectStrength(BigDecimal v) { this.projectStrength = v; }
    public BigDecimal getCertificationStrength() { return certificationStrength; } public void setCertificationStrength(BigDecimal v) { this.certificationStrength = v; }
    public String getRecommendations() { return recommendations; } public void setRecommendations(String v) { this.recommendations = v; }
    public String getMissingItems() { return missingItems; } public void setMissingItems(String v) { this.missingItems = v; }
    public OffsetDateTime getAnalyzedAt() { return analyzedAt; } public void setAnalyzedAt(OffsetDateTime v) { this.analyzedAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
