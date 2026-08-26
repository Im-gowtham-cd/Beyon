package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "skill_recommendations")
public class SkillRecommendation {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "skill_id") private UUID skillId;
    @Column(name = "skill_name", nullable = false, length = 200) private String skillName;
    @Column(name = "recommendation_type", nullable = false, length = 30) private String recommendationType;
    @Column(nullable = false, precision = 5, scale = 2) private BigDecimal score = BigDecimal.ZERO;
    @Column(columnDefinition = "text") private String reason;
    @Column(nullable = false, length = 20) private String status = "PENDING";
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "completed_at") private OffsetDateTime completedAt;

    public SkillRecommendation() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getSkillId() { return skillId; } public void setSkillId(UUID v) { this.skillId = v; }
    public String getSkillName() { return skillName; } public void setSkillName(String v) { this.skillName = v; }
    public String getRecommendationType() { return recommendationType; } public void setRecommendationType(String v) { this.recommendationType = v; }
    public BigDecimal getScore() { return score; } public void setScore(BigDecimal v) { this.score = v; }
    public String getReason() { return reason; } public void setReason(String v) { this.reason = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getCompletedAt() { return completedAt; } public void setCompletedAt(OffsetDateTime v) { this.completedAt = v; }
}
