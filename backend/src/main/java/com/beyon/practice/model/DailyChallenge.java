package com.beyon.practice.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "daily_challenges", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "challenge_date"}))
public class DailyChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private UUID studentId;

    @Column(nullable = false)
    private LocalDate challengeDate;

    @Column(nullable = false)
    private UUID questionId;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    private Instant startedAt;

    private Instant completedAt;

    private Integer timeSpentSeconds;

    private Boolean correct;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public LocalDate getChallengeDate() { return challengeDate; }
    public void setChallengeDate(LocalDate challengeDate) { this.challengeDate = challengeDate; }
    public UUID getQuestionId() { return questionId; }
    public void setQuestionId(UUID questionId) { this.questionId = questionId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public Integer getTimeSpentSeconds() { return timeSpentSeconds; }
    public void setTimeSpentSeconds(Integer timeSpentSeconds) { this.timeSpentSeconds = timeSpentSeconds; }
    public Boolean isCorrect() { return correct; }
    public void setCorrect(Boolean correct) { this.correct = correct; }
    public Instant getCreatedAt() { return createdAt; }
}
