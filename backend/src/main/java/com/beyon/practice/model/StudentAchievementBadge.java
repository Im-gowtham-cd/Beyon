package com.beyon.practice.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_achievements_gamification", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "achievement_key"}))
public class StudentAchievementBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private UUID studentId;

    @Column(nullable = false, length = 100)
    private String achievementKey;

    @Column(nullable = false, length = 200)
    private String achievementName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 10)
    private String badgeIcon;

    @Column(nullable = false, updatable = false)
    private Instant earnedAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public String getAchievementKey() { return achievementKey; }
    public void setAchievementKey(String achievementKey) { this.achievementKey = achievementKey; }
    public String getAchievementName() { return achievementName; }
    public void setAchievementName(String achievementName) { this.achievementName = achievementName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getBadgeIcon() { return badgeIcon; }
    public void setBadgeIcon(String badgeIcon) { this.badgeIcon = badgeIcon; }
    public Instant getEarnedAt() { return earnedAt; }
}
