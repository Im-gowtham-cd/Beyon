package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_growth_scores", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id"})
})
public class StudentGrowthScore {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "overall_score", nullable = false) private BigDecimal overallScore = BigDecimal.ZERO;
    @Column(name = "skills_score", nullable = false) private BigDecimal skillsScore = BigDecimal.ZERO;
    @Column(name = "consistency_score", nullable = false) private BigDecimal consistencyScore = BigDecimal.ZERO;
    @Column(name = "assessment_score", nullable = false) private BigDecimal assessmentScore = BigDecimal.ZERO;
    @Column(name = "certification_score", nullable = false) private BigDecimal certificationScore = BigDecimal.ZERO;
    @Column(name = "project_score", nullable = false) private BigDecimal projectScore = BigDecimal.ZERO;
    @Column(name = "career_ready_score", nullable = false) private BigDecimal careerReadyScore = BigDecimal.ZERO;
    @Column(name = "career_readiness", nullable = false, length = 30) private String careerReadiness = "NOT_READY";
    @Column(name = "computed_at") private OffsetDateTime computedAt;

    @PrePersist void onCreate() { computedAt = OffsetDateTime.now(); }

    public StudentGrowthScore() {}

    public UUID getId() { return id; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public BigDecimal getOverallScore() { return overallScore; } public void setOverallScore(BigDecimal v) { this.overallScore = v; }
    public BigDecimal getSkillsScore() { return skillsScore; } public void setSkillsScore(BigDecimal v) { this.skillsScore = v; }
    public BigDecimal getConsistencyScore() { return consistencyScore; } public void setConsistencyScore(BigDecimal v) { this.consistencyScore = v; }
    public BigDecimal getAssessmentScore() { return assessmentScore; } public void setAssessmentScore(BigDecimal v) { this.assessmentScore = v; }
    public BigDecimal getCertificationScore() { return certificationScore; } public void setCertificationScore(BigDecimal v) { this.certificationScore = v; }
    public BigDecimal getProjectScore() { return projectScore; } public void setProjectScore(BigDecimal v) { this.projectScore = v; }
    public BigDecimal getCareerReadyScore() { return careerReadyScore; } public void setCareerReadyScore(BigDecimal v) { this.careerReadyScore = v; }
    public String getCareerReadiness() { return careerReadiness; } public void setCareerReadiness(String v) { this.careerReadiness = v; }
    public OffsetDateTime getComputedAt() { return computedAt; } public void setComputedAt(OffsetDateTime v) { this.computedAt = v; }
}
