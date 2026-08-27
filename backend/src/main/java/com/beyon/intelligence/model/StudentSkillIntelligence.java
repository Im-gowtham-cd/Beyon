package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_skill_intelligence")
public class StudentSkillIntelligence {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "skill_id", nullable = false) private UUID skillId;
    @Column(name = "proficiency_level", nullable = false, length = 30) private String proficiencyLevel = "BEGINNER";
    @Column(name = "confidence_score", nullable = false, precision = 5, scale = 2) private BigDecimal confidenceScore = BigDecimal.ZERO;
    @Column(name = "evidence_count", nullable = false) private Integer evidenceCount = 0;
    @Column(name = "total_questions_solved", nullable = false) private Integer totalQuestionsSolved = 0;
    @Column(nullable = false, precision = 5, scale = 2) private BigDecimal accuracy = BigDecimal.ZERO;
    @Column(name = "assessment_count", nullable = false) private Integer assessmentCount = 0;
    @Column(name = "certification_count", nullable = false) private Integer certificationCount = 0;
    @Column(name = "project_count", nullable = false) private Integer projectCount = 0;
    @Column(name = "practice_count", nullable = false) private Integer practiceCount = 0;
    @Column(name = "improvement_trend", length = 20) private String improvementTrend = "STABLE";
    @Column(name = "last_assessed_at") private OffsetDateTime lastAssessedAt;
    @Column(nullable = false) private Boolean verified = false;
    @Column(name = "evidence_summary", columnDefinition = "text") private String evidenceSummary;
    @Column(name = "score_history", columnDefinition = "text") private String scoreHistory;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public StudentSkillIntelligence() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getSkillId() { return skillId; } public void setSkillId(UUID v) { this.skillId = v; }
    public String getProficiencyLevel() { return proficiencyLevel; } public void setProficiencyLevel(String v) { this.proficiencyLevel = v; }
    public BigDecimal getConfidenceScore() { return confidenceScore; } public void setConfidenceScore(BigDecimal v) { this.confidenceScore = v; }
    public Integer getEvidenceCount() { return evidenceCount; } public void setEvidenceCount(Integer v) { this.evidenceCount = v; }
    public Integer getTotalQuestionsSolved() { return totalQuestionsSolved; } public void setTotalQuestionsSolved(Integer v) { this.totalQuestionsSolved = v; }
    public BigDecimal getAccuracy() { return accuracy; } public void setAccuracy(BigDecimal v) { this.accuracy = v; }
    public Integer getAssessmentCount() { return assessmentCount; } public void setAssessmentCount(Integer v) { this.assessmentCount = v; }
    public Integer getCertificationCount() { return certificationCount; } public void setCertificationCount(Integer v) { this.certificationCount = v; }
    public Integer getProjectCount() { return projectCount; } public void setProjectCount(Integer v) { this.projectCount = v; }
    public Integer getPracticeCount() { return practiceCount; } public void setPracticeCount(Integer v) { this.practiceCount = v; }
    public String getImprovementTrend() { return improvementTrend; } public void setImprovementTrend(String v) { this.improvementTrend = v; }
    public OffsetDateTime getLastAssessedAt() { return lastAssessedAt; } public void setLastAssessedAt(OffsetDateTime v) { this.lastAssessedAt = v; }
    public Boolean getVerified() { return verified; } public void setVerified(Boolean v) { this.verified = v; }
    public String getEvidenceSummary() { return evidenceSummary; } public void setEvidenceSummary(String v) { this.evidenceSummary = v; }
    public String getScoreHistory() { return scoreHistory; } public void setScoreHistory(String v) { this.scoreHistory = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
