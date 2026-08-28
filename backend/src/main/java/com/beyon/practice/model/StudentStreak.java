package com.beyon.practice.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "student_streaks")
public class StudentStreak {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "varchar(36)")
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID studentId;

    @Column(nullable = false)
    private int currentStreak = 0;

    @Column(nullable = false)
    private int longestStreak = 0;

    private LocalDate lastActivityDate;

    @Column(nullable = false)
    private int streakFreezesUsed = 0;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }
    public int getLongestStreak() { return longestStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }
    public LocalDate getLastActivityDate() { return lastActivityDate; }
    public void setLastActivityDate(LocalDate lastActivityDate) { this.lastActivityDate = lastActivityDate; }
    public int getStreakFreezesUsed() { return streakFreezesUsed; }
    public void setStreakFreezesUsed(int streakFreezesUsed) { this.streakFreezesUsed = streakFreezesUsed; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
