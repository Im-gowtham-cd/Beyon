package com.beyon.practice.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "weekly_test_attempts", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "weekly_test_id"})
})
public class WeeklyTestAttempt {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "weekly_test_id", nullable = false) private UUID weeklyTestId;
    @Column(nullable = false) private Integer score = 0;
    @Column(name = "total_questions", nullable = false) private Integer totalQuestions;
    @Column(name = "correct_answers", nullable = false) private Integer correctAnswers = 0;
    @Column(name = "time_taken_seconds") private Integer timeTakenSeconds;
    private BigDecimal percentile;
    @Column(name = "xp_earned", nullable = false) private Integer xpEarned = 0;
    @Column(name = "coins_earned", nullable = false) private Integer coinsEarned = 0;
    @Column(nullable = false, length = 20) private String status = "IN_PROGRESS";
    @Column(name = "started_at") private OffsetDateTime startedAt;
    @Column(name = "completed_at") private OffsetDateTime completedAt;

    @PrePersist void onCreate() { startedAt = OffsetDateTime.now(); }

    public WeeklyTestAttempt() {}

    public UUID getId() { return id; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getWeeklyTestId() { return weeklyTestId; } public void setWeeklyTestId(UUID v) { this.weeklyTestId = v; }
    public Integer getScore() { return score; } public void setScore(Integer v) { this.score = v; }
    public Integer getTotalQuestions() { return totalQuestions; } public void setTotalQuestions(Integer v) { this.totalQuestions = v; }
    public Integer getCorrectAnswers() { return correctAnswers; } public void setCorrectAnswers(Integer v) { this.correctAnswers = v; }
    public Integer getTimeTakenSeconds() { return timeTakenSeconds; } public void setTimeTakenSeconds(Integer v) { this.timeTakenSeconds = v; }
    public BigDecimal getPercentile() { return percentile; } public void setPercentile(BigDecimal v) { this.percentile = v; }
    public Integer getXpEarned() { return xpEarned; } public void setXpEarned(Integer v) { this.xpEarned = v; }
    public Integer getCoinsEarned() { return coinsEarned; } public void setCoinsEarned(Integer v) { this.coinsEarned = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public OffsetDateTime getStartedAt() { return startedAt; }
    public OffsetDateTime getCompletedAt() { return completedAt; } public void setCompletedAt(OffsetDateTime v) { this.completedAt = v; }
}
