package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "personalized_challenge_config")
public class PersonalizedChallengeConfig {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false, unique = true) private UUID studentId;
    @Column(name = "target_career_path_id") private UUID targetCareerPathId;
    @Column(name = "difficulty_weight", nullable = false, precision = 3, scale = 2) private BigDecimal difficultyWeight = new BigDecimal("0.30");
    @Column(name = "gap_weight", nullable = false, precision = 3, scale = 2) private BigDecimal gapWeight = new BigDecimal("0.40");
    @Column(name = "streak_weight", nullable = false, precision = 3, scale = 2) private BigDecimal streakWeight = new BigDecimal("0.15");
    @Column(name = "variety_weight", nullable = false, precision = 3, scale = 2) private BigDecimal varietyWeight = new BigDecimal("0.15");
    @Column(nullable = false, columnDefinition = "jsonb") private String preferredTopics = "[]";
    @Column(nullable = false, columnDefinition = "jsonb") private String avoidTopics = "[]";
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public PersonalizedChallengeConfig() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getTargetCareerPathId() { return targetCareerPathId; } public void setTargetCareerPathId(UUID v) { this.targetCareerPathId = v; }
    public BigDecimal getDifficultyWeight() { return difficultyWeight; } public void setDifficultyWeight(BigDecimal v) { this.difficultyWeight = v; }
    public BigDecimal getGapWeight() { return gapWeight; } public void setGapWeight(BigDecimal v) { this.gapWeight = v; }
    public BigDecimal getStreakWeight() { return streakWeight; } public void setStreakWeight(BigDecimal v) { this.streakWeight = v; }
    public BigDecimal getVarietyWeight() { return varietyWeight; } public void setVarietyWeight(BigDecimal v) { this.varietyWeight = v; }
    public String getPreferredTopics() { return preferredTopics; } public void setPreferredTopics(String v) { this.preferredTopics = v; }
    public String getAvoidTopics() { return avoidTopics; } public void setAvoidTopics(String v) { this.avoidTopics = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
