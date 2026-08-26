package com.beyon.practice.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "weekly_tests", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"week_number", "year"})
})
public class WeeklyTest {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, length = 200) private String title;
    @Column(columnDefinition = "text") private String description;
    @Column(name = "week_number", nullable = false) private Integer weekNumber;
    @Column(nullable = false) private Integer year;
    @Column(name = "duration_minutes", nullable = false) private Integer durationMinutes = 60;
    @Column(name = "total_questions", nullable = false) private Integer totalQuestions = 40;
    @Column(name = "passing_score", nullable = false) private Integer passingScore = 40;
    @Column(name = "coin_reward", nullable = false) private Integer coinReward = 100;
    @Column(name = "xp_reward", nullable = false) private Integer xpReward = 200;
    @Column(nullable = false, length = 20) private String status = "UPCOMING";
    @Column(name = "created_at") private OffsetDateTime createdAt;

    @PrePersist void onCreate() { createdAt = OffsetDateTime.now(); }

    public WeeklyTest() {}

    public UUID getId() { return id; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public Integer getWeekNumber() { return weekNumber; } public void setWeekNumber(Integer v) { this.weekNumber = v; }
    public Integer getYear() { return year; } public void setYear(Integer v) { this.year = v; }
    public Integer getDurationMinutes() { return durationMinutes; } public void setDurationMinutes(Integer v) { this.durationMinutes = v; }
    public Integer getTotalQuestions() { return totalQuestions; } public void setTotalQuestions(Integer v) { this.totalQuestions = v; }
    public Integer getPassingScore() { return passingScore; } public void setPassingScore(Integer v) { this.passingScore = v; }
    public Integer getCoinReward() { return coinReward; } public void setCoinReward(Integer v) { this.coinReward = v; }
    public Integer getXpReward() { return xpReward; } public void setXpReward(Integer v) { this.xpReward = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
