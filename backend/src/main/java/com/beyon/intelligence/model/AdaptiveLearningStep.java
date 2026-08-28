package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "adaptive_learning_steps")
public class AdaptiveLearningStep {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "path_id", nullable = false) private UUID pathId;
    @Column(name = "step_order", nullable = false) private Integer stepOrder;
    @Column(name = "skill_id") private UUID skillId;
    @Column(name = "skill_name", nullable = false, length = 200) private String skillName;
    @Column(length = 500) private String concept;
    @Column(nullable = false, columnDefinition = "text") private String prerequisites = "[]";
    @Column(nullable = false, columnDefinition = "text") private String learningResources = "[]";
    @Column(name = "practice_question_ids", nullable = false, columnDefinition = "text") private String practiceQuestionIds = "[]";
    @Column(name = "assessment_id") private UUID assessmentId;
    @Column(name = "project_suggestion", columnDefinition = "text") private String projectSuggestion;
    @Column(nullable = false, length = 20) private String state = "LOCKED";
    @Column(nullable = false, precision = 5, scale = 2) private BigDecimal progress = BigDecimal.ZERO;
    @Column(name = "started_at") private OffsetDateTime startedAt;
    @Column(name = "completed_at") private OffsetDateTime completedAt;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public AdaptiveLearningStep() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getPathId() { return pathId; } public void setPathId(UUID v) { this.pathId = v; }
    public Integer getStepOrder() { return stepOrder; } public void setStepOrder(Integer v) { this.stepOrder = v; }
    public UUID getSkillId() { return skillId; } public void setSkillId(UUID v) { this.skillId = v; }
    public String getSkillName() { return skillName; } public void setSkillName(String v) { this.skillName = v; }
    public String getConcept() { return concept; } public void setConcept(String v) { this.concept = v; }
    public String getPrerequisites() { return prerequisites; } public void setPrerequisites(String v) { this.prerequisites = v; }
    public String getLearningResources() { return learningResources; } public void setLearningResources(String v) { this.learningResources = v; }
    public String getPracticeQuestionIds() { return practiceQuestionIds; } public void setPracticeQuestionIds(String v) { this.practiceQuestionIds = v; }
    public UUID getAssessmentId() { return assessmentId; } public void setAssessmentId(UUID v) { this.assessmentId = v; }
    public String getProjectSuggestion() { return projectSuggestion; } public void setProjectSuggestion(String v) { this.projectSuggestion = v; }
    public String getState() { return state; } public void setState(String v) { this.state = v; }
    public BigDecimal getProgress() { return progress; } public void setProgress(BigDecimal v) { this.progress = v; }
    public OffsetDateTime getStartedAt() { return startedAt; } public void setStartedAt(OffsetDateTime v) { this.startedAt = v; }
    public OffsetDateTime getCompletedAt() { return completedAt; } public void setCompletedAt(OffsetDateTime v) { this.completedAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
