package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "skill_gaps")
public class SkillGap {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "career_path_id") private UUID careerPathId;
    @Column(name = "opportunity_id") private UUID opportunityId;
    @Column(name = "required_skill_id", nullable = false) private UUID requiredSkillId;
    @Column(name = "current_level", nullable = false, length = 30) private String currentLevel = "NONE";
    @Column(name = "required_level", nullable = false, length = 30) private String requiredLevel;
    @Column(name = "gap_severity", nullable = false, length = 20) private String gapSeverity = "MEDIUM";
    @Column(columnDefinition = "text") private String recommendation;
    @Column(name = "estimated_effort_hours") private Integer estimatedEffortHours;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public SkillGap() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getCareerPathId() { return careerPathId; } public void setCareerPathId(UUID v) { this.careerPathId = v; }
    public UUID getOpportunityId() { return opportunityId; } public void setOpportunityId(UUID v) { this.opportunityId = v; }
    public UUID getRequiredSkillId() { return requiredSkillId; } public void setRequiredSkillId(UUID v) { this.requiredSkillId = v; }
    public String getCurrentLevel() { return currentLevel; } public void setCurrentLevel(String v) { this.currentLevel = v; }
    public String getRequiredLevel() { return requiredLevel; } public void setRequiredLevel(String v) { this.requiredLevel = v; }
    public String getGapSeverity() { return gapSeverity; } public void setGapSeverity(String v) { this.gapSeverity = v; }
    public String getRecommendation() { return recommendation; } public void setRecommendation(String v) { this.recommendation = v; }
    public Integer getEstimatedEffortHours() { return estimatedEffortHours; } public void setEstimatedEffortHours(Integer v) { this.estimatedEffortHours = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
