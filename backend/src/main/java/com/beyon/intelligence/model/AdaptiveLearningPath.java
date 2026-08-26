package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "adaptive_learning_paths")
public class AdaptiveLearningPath {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "career_path_id", nullable = false) private UUID careerPathId;
    @Column(name = "current_step_index", nullable = false) private Integer currentStepIndex = 0;
    @Column(name = "overall_progress", nullable = false, precision = 5, scale = 2) private BigDecimal overallProgress = BigDecimal.ZERO;
    @Column(nullable = false, length = 20) private String status = "ACTIVE";
    @Column(name = "started_at", nullable = false) private OffsetDateTime startedAt = OffsetDateTime.now();
    @Column(name = "completed_at") private OffsetDateTime completedAt;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public AdaptiveLearningPath() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getCareerPathId() { return careerPathId; } public void setCareerPathId(UUID v) { this.careerPathId = v; }
    public Integer getCurrentStepIndex() { return currentStepIndex; } public void setCurrentStepIndex(Integer v) { this.currentStepIndex = v; }
    public BigDecimal getOverallProgress() { return overallProgress; } public void setOverallProgress(BigDecimal v) { this.overallProgress = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public OffsetDateTime getStartedAt() { return startedAt; } public void setStartedAt(OffsetDateTime v) { this.startedAt = v; }
    public OffsetDateTime getCompletedAt() { return completedAt; } public void setCompletedAt(OffsetDateTime v) { this.completedAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
