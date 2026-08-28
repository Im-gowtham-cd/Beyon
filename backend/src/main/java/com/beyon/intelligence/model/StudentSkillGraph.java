package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_skill_graph")
public class StudentSkillGraph {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "skill_id", nullable = false) private UUID skillId;
    @Column(name = "proficiency_pct", nullable = false, precision = 5, scale = 2) private BigDecimal proficiencyPct = BigDecimal.ZERO;
    @Column(nullable = false, length = 30) private String level = "BEGINNER";
    @Column(nullable = false, precision = 5, scale = 2) private BigDecimal confidence = BigDecimal.ZERO;
    @Column(name = "evidence_count", nullable = false) private Integer evidenceCount = 0;
    @Column(nullable = false, columnDefinition = "text") private String sources = "[]";
    @Column(name = "improvement_trend", nullable = false, length = 20) private String improvementTrend = "STABLE";
    @Column(name = "last_assessed_at") private OffsetDateTime lastAssessedAt;
    @Column(nullable = false) private Boolean verified = false;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public StudentSkillGraph() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getSkillId() { return skillId; } public void setSkillId(UUID v) { this.skillId = v; }
    public BigDecimal getProficiencyPct() { return proficiencyPct; } public void setProficiencyPct(BigDecimal v) { this.proficiencyPct = v; }
    public String getLevel() { return level; } public void setLevel(String v) { this.level = v; }
    public BigDecimal getConfidence() { return confidence; } public void setConfidence(BigDecimal v) { this.confidence = v; }
    public Integer getEvidenceCount() { return evidenceCount; } public void setEvidenceCount(Integer v) { this.evidenceCount = v; }
    public String getSources() { return sources; } public void setSources(String v) { this.sources = v; }
    public String getImprovementTrend() { return improvementTrend; } public void setImprovementTrend(String v) { this.improvementTrend = v; }
    public OffsetDateTime getLastAssessedAt() { return lastAssessedAt; } public void setLastAssessedAt(OffsetDateTime v) { this.lastAssessedAt = v; }
    public Boolean getVerified() { return verified; } public void setVerified(Boolean v) { this.verified = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
