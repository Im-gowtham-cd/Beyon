package com.beyon.assessment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "assessment_results")
public class AssessmentResult {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "session_id", nullable = false) private UUID sessionId;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "overall_score", nullable = false, precision = 5, scale = 2) private BigDecimal overallScore = BigDecimal.ZERO;
    @Column(name = "max_score", nullable = false, precision = 5, scale = 2) private BigDecimal maxScore = BigDecimal.ZERO;
    @Column(nullable = false, precision = 5, scale = 2) private BigDecimal accuracy = BigDecimal.ZERO;
    @Column(precision = 5, scale = 2) private BigDecimal percentile;
    @Column(nullable = false, length = 20) private String status = "PENDING";
    @Column(name = "section_scores", columnDefinition = "jsonb") private String sectionScores;
    @Column(name = "skill_scores", columnDefinition = "jsonb") private String skillScores;
    @Column(name = "time_taken_seconds") private Integer timeTakenSeconds = 0;
    @Column(name = "questions_attempted") private Integer questionsAttempted = 0;
    @Column(name = "questions_correct") private Integer questionsCorrect = 0;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public AssessmentResult() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getSessionId() { return sessionId; } public void setSessionId(UUID v) { this.sessionId = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public BigDecimal getOverallScore() { return overallScore; } public void setOverallScore(BigDecimal v) { this.overallScore = v; }
    public BigDecimal getMaxScore() { return maxScore; } public void setMaxScore(BigDecimal v) { this.maxScore = v; }
    public BigDecimal getAccuracy() { return accuracy; } public void setAccuracy(BigDecimal v) { this.accuracy = v; }
    public BigDecimal getPercentile() { return percentile; } public void setPercentile(BigDecimal v) { this.percentile = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public String getSectionScores() { return sectionScores; } public void setSectionScores(String v) { this.sectionScores = v; }
    public String getSkillScores() { return skillScores; } public void setSkillScores(String v) { this.skillScores = v; }
    public Integer getTimeTakenSeconds() { return timeTakenSeconds; } public void setTimeTakenSeconds(Integer v) { this.timeTakenSeconds = v; }
    public Integer getQuestionsAttempted() { return questionsAttempted; } public void setQuestionsAttempted(Integer v) { this.questionsAttempted = v; }
    public Integer getQuestionsCorrect() { return questionsCorrect; } public void setQuestionsCorrect(Integer v) { this.questionsCorrect = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
