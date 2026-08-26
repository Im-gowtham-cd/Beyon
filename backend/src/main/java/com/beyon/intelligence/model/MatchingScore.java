package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "matching_scores")
public class MatchingScore {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "opportunity_id", nullable = false) private UUID opportunityId;
    @Column(name = "total_score", nullable = false, precision = 5, scale = 2) private BigDecimal totalScore = BigDecimal.ZERO;
    @Column(name = "skill_score", precision = 5, scale = 2) private BigDecimal skillScore = BigDecimal.ZERO;
    @Column(name = "academic_score", precision = 5, scale = 2) private BigDecimal academicScore = BigDecimal.ZERO;
    @Column(name = "assessment_score", precision = 5, scale = 2) private BigDecimal assessmentScore = BigDecimal.ZERO;
    @Column(name = "experience_score", precision = 5, scale = 2) private BigDecimal experienceScore = BigDecimal.ZERO;
    @Column(columnDefinition = "jsonb") private String matchFactors;
    @Column(name = "matched_at", nullable = false) private OffsetDateTime matchedAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public MatchingScore() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getOpportunityId() { return opportunityId; } public void setOpportunityId(UUID v) { this.opportunityId = v; }
    public BigDecimal getTotalScore() { return totalScore; } public void setTotalScore(BigDecimal v) { this.totalScore = v; }
    public BigDecimal getSkillScore() { return skillScore; } public void setSkillScore(BigDecimal v) { this.skillScore = v; }
    public BigDecimal getAcademicScore() { return academicScore; } public void setAcademicScore(BigDecimal v) { this.academicScore = v; }
    public BigDecimal getAssessmentScore() { return assessmentScore; } public void setAssessmentScore(BigDecimal v) { this.assessmentScore = v; }
    public BigDecimal getExperienceScore() { return experienceScore; } public void setExperienceScore(BigDecimal v) { this.experienceScore = v; }
    public String getMatchFactors() { return matchFactors; } public void setMatchFactors(String v) { this.matchFactors = v; }
    public OffsetDateTime getMatchedAt() { return matchedAt; } public void setMatchedAt(OffsetDateTime v) { this.matchedAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
