package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "challenge_selection_log")
public class ChallengeSelectionLog {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "question_id", nullable = false) private UUID questionId;
    @Column(name = "skill_id") private UUID skillId;
    @Column(name = "selection_reason", length = 100) private String selectionReason;
    @Column(name = "difficulty_score", precision = 5, scale = 2) private BigDecimal difficultyScore;
    @Column(name = "gap_score", precision = 5, scale = 2) private BigDecimal gapScore;
    @Column(name = "streak_relevance", precision = 3, scale = 2) private BigDecimal streakRelevance;
    @Column(name = "selected_at", nullable = false) private OffsetDateTime selectedAt = OffsetDateTime.now();

    public ChallengeSelectionLog() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getQuestionId() { return questionId; } public void setQuestionId(UUID v) { this.questionId = v; }
    public UUID getSkillId() { return skillId; } public void setSkillId(UUID v) { this.skillId = v; }
    public String getSelectionReason() { return selectionReason; } public void setSelectionReason(String v) { this.selectionReason = v; }
    public BigDecimal getDifficultyScore() { return difficultyScore; } public void setDifficultyScore(BigDecimal v) { this.difficultyScore = v; }
    public BigDecimal getGapScore() { return gapScore; } public void setGapScore(BigDecimal v) { this.gapScore = v; }
    public BigDecimal getStreakRelevance() { return streakRelevance; } public void setStreakRelevance(BigDecimal v) { this.streakRelevance = v; }
    public OffsetDateTime getSelectedAt() { return selectedAt; } public void setSelectedAt(OffsetDateTime v) { this.selectedAt = v; }
}
