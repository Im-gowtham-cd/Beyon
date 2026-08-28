package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "placement_readiness_scores")
public class PlacementReadinessScore {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false, unique = true) private UUID studentId;
    @Column(name = "overall_score", nullable = false, precision = 5, scale = 2) private BigDecimal overallScore = BigDecimal.ZERO;
    @Column(name = "skills_score", nullable = false, precision = 5, scale = 2) private BigDecimal skillsScore = BigDecimal.ZERO;
    @Column(name = "assessments_score", nullable = false, precision = 5, scale = 2) private BigDecimal assessmentsScore = BigDecimal.ZERO;
    @Column(name = "projects_score", nullable = false, precision = 5, scale = 2) private BigDecimal projectsScore = BigDecimal.ZERO;
    @Column(name = "certifications_score", nullable = false, precision = 5, scale = 2) private BigDecimal certificationsScore = BigDecimal.ZERO;
    @Column(name = "interview_score", nullable = false, precision = 5, scale = 2) private BigDecimal interviewScore = BigDecimal.ZERO;
    @Column(name = "practice_score", nullable = false, precision = 5, scale = 2) private BigDecimal practiceScore = BigDecimal.ZERO;
    @Column(nullable = false, columnDefinition = "text") private String recommendations = "[]";
    @Column(name = "calculated_at", nullable = false) private OffsetDateTime calculatedAt = OffsetDateTime.now();
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public PlacementReadinessScore() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public BigDecimal getOverallScore() { return overallScore; } public void setOverallScore(BigDecimal v) { this.overallScore = v; }
    public BigDecimal getSkillsScore() { return skillsScore; } public void setSkillsScore(BigDecimal v) { this.skillsScore = v; }
    public BigDecimal getAssessmentsScore() { return assessmentsScore; } public void setAssessmentsScore(BigDecimal v) { this.assessmentsScore = v; }
    public BigDecimal getProjectsScore() { return projectsScore; } public void setProjectsScore(BigDecimal v) { this.projectsScore = v; }
    public BigDecimal getCertificationsScore() { return certificationsScore; } public void setCertificationsScore(BigDecimal v) { this.certificationsScore = v; }
    public BigDecimal getInterviewScore() { return interviewScore; } public void setInterviewScore(BigDecimal v) { this.interviewScore = v; }
    public BigDecimal getPracticeScore() { return practiceScore; } public void setPracticeScore(BigDecimal v) { this.practiceScore = v; }
    public String getRecommendations() { return recommendations; } public void setRecommendations(String v) { this.recommendations = v; }
    public OffsetDateTime getCalculatedAt() { return calculatedAt; } public void setCalculatedAt(OffsetDateTime v) { this.calculatedAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
