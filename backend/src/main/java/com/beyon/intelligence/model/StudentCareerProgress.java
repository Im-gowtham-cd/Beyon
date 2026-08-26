package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_career_progress")
public class StudentCareerProgress {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "career_path_id", nullable = false) private UUID careerPathId;
    @Column(name = "target_level", nullable = false, length = 30) private String targetLevel = "INTERMEDIATE";
    @Column(name = "readiness_score", nullable = false, precision = 5, scale = 2) private BigDecimal readinessScore = BigDecimal.ZERO;
    @Column(name = "skills_acquired", nullable = false) private Integer skillsAcquired = 0;
    @Column(name = "skills_total", nullable = false) private Integer skillsTotal = 0;
    @Column(name = "started_at", nullable = false) private OffsetDateTime startedAt = OffsetDateTime.now();
    @Column(name = "last_updated_at", nullable = false) private OffsetDateTime lastUpdatedAt = OffsetDateTime.now();

    public StudentCareerProgress() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getCareerPathId() { return careerPathId; } public void setCareerPathId(UUID v) { this.careerPathId = v; }
    public String getTargetLevel() { return targetLevel; } public void setTargetLevel(String v) { this.targetLevel = v; }
    public BigDecimal getReadinessScore() { return readinessScore; } public void setReadinessScore(BigDecimal v) { this.readinessScore = v; }
    public Integer getSkillsAcquired() { return skillsAcquired; } public void setSkillsAcquired(Integer v) { this.skillsAcquired = v; }
    public Integer getSkillsTotal() { return skillsTotal; } public void setSkillsTotal(Integer v) { this.skillsTotal = v; }
    public OffsetDateTime getStartedAt() { return startedAt; } public void setStartedAt(OffsetDateTime v) { this.startedAt = v; }
    public OffsetDateTime getLastUpdatedAt() { return lastUpdatedAt; } public void setLastUpdatedAt(OffsetDateTime v) { this.lastUpdatedAt = v; }
}
