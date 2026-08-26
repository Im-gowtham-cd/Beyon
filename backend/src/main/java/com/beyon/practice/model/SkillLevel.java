package com.beyon.practice.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "skill_levels", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "skill_id"})
})
public class SkillLevel {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "skill_id", nullable = false) private UUID skillId;
    @Column(name = "total_xp", nullable = false) private Integer totalXp = 0;
    @Column(nullable = false) private Integer level = 1;
    @Column(name = "level_name", nullable = false, length = 30) private String levelName = "BEGINNER";
    @Column(name = "created_at") private OffsetDateTime createdAt;
    @Column(name = "updated_at") private OffsetDateTime updatedAt;

    @PrePersist void onCreate() { createdAt = OffsetDateTime.now(); updatedAt = OffsetDateTime.now(); }
    @PreUpdate void onUpdate() { updatedAt = OffsetDateTime.now(); }

    public SkillLevel() {}

    public UUID getId() { return id; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getSkillId() { return skillId; } public void setSkillId(UUID v) { this.skillId = v; }
    public Integer getTotalXp() { return totalXp; } public void setTotalXp(Integer v) { this.totalXp = v; }
    public Integer getLevel() { return level; } public void setLevel(Integer v) { this.level = v; }
    public String getLevelName() { return levelName; } public void setLevelName(String v) { this.levelName = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
