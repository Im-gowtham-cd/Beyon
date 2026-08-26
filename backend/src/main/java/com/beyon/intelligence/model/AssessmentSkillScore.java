package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "assessment_skill_scores")
public class AssessmentSkillScore {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "session_id", nullable = false) private UUID sessionId;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "skill_id", nullable = false) private UUID skillId;
    @Column(length = 200) private String topic;
    @Column(nullable = false, precision = 5, scale = 2) private BigDecimal score = BigDecimal.ZERO;
    @Column(nullable = false, precision = 5, scale = 2) private BigDecimal accuracy = BigDecimal.ZERO;
    @Column(name = "questions_attempted", nullable = false) private Integer questionsAttempted = 0;
    @Column(name = "questions_correct", nullable = false) private Integer questionsCorrect = 0;
    @Column(name = "time_spent_seconds", nullable = false) private Integer timeSpentSeconds = 0;
    @Column(name = "difficulty_avg", precision = 3, scale = 2) private BigDecimal difficultyAvg;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public AssessmentSkillScore() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getSessionId() { return sessionId; } public void setSessionId(UUID v) { this.sessionId = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getSkillId() { return skillId; } public void setSkillId(UUID v) { this.skillId = v; }
    public String getTopic() { return topic; } public void setTopic(String v) { this.topic = v; }
    public BigDecimal getScore() { return score; } public void setScore(BigDecimal v) { this.score = v; }
    public BigDecimal getAccuracy() { return accuracy; } public void setAccuracy(BigDecimal v) { this.accuracy = v; }
    public Integer getQuestionsAttempted() { return questionsAttempted; } public void setQuestionsAttempted(Integer v) { this.questionsAttempted = v; }
    public Integer getQuestionsCorrect() { return questionsCorrect; } public void setQuestionsCorrect(Integer v) { this.questionsCorrect = v; }
    public Integer getTimeSpentSeconds() { return timeSpentSeconds; } public void setTimeSpentSeconds(Integer v) { this.timeSpentSeconds = v; }
    public BigDecimal getDifficultyAvg() { return difficultyAvg; } public void setDifficultyAvg(BigDecimal v) { this.difficultyAvg = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
