package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "career_roadmap_items")
public class CareerRoadmapItem {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "career_path_id", nullable = false) private UUID careerPathId;
    @Column(name = "skill_name", nullable = false, length = 200) private String skillName;
    @Column(name = "sort_order", nullable = false) private Integer sortOrder = 0;
    @Column(nullable = false, length = 20) private String state = "LOCKED";
    @Column(nullable = false, precision = 5, scale = 2) private BigDecimal progress = BigDecimal.ZERO;
    @Column(name = "required_coins") private Integer requiredCoins = 0;
    @Column(name = "unlocked_at") private OffsetDateTime unlockedAt;
    @Column(name = "completed_at") private OffsetDateTime completedAt;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public CareerRoadmapItem() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getCareerPathId() { return careerPathId; } public void setCareerPathId(UUID v) { this.careerPathId = v; }
    public String getSkillName() { return skillName; } public void setSkillName(String v) { this.skillName = v; }
    public Integer getSortOrder() { return sortOrder; } public void setSortOrder(Integer v) { this.sortOrder = v; }
    public String getState() { return state; } public void setState(String v) { this.state = v; }
    public BigDecimal getProgress() { return progress; } public void setProgress(BigDecimal v) { this.progress = v; }
    public Integer getRequiredCoins() { return requiredCoins; } public void setRequiredCoins(Integer v) { this.requiredCoins = v; }
    public OffsetDateTime getUnlockedAt() { return unlockedAt; } public void setUnlockedAt(OffsetDateTime v) { this.unlockedAt = v; }
    public OffsetDateTime getCompletedAt() { return completedAt; } public void setCompletedAt(OffsetDateTime v) { this.completedAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
