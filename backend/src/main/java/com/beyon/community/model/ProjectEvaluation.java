package com.beyon.community.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_evaluations")
public class ProjectEvaluation {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "project_id", nullable = false) private UUID projectId;
    @Column(name = "team_id") private UUID teamId;
    @Column(name = "evaluator_id", nullable = false) private UUID evaluatorId;
    @Column(name = "evaluator_type", nullable = false, length = 50) private String evaluatorType;
    @Column(name = "technical_quality") private Integer technicalQuality = 0;
    @Column private Integer innovation = 0;
    @Column(name = "code_quality") private Integer codeQuality = 0;
    @Column private Integer documentation = 0;
    @Column private Integer presentation = 0;
    @Column(name = "problem_solving") private Integer problemSolving = 0;
    @Column private Integer teamwork = 0;
    @Column(name = "overall_score", precision = 5, scale = 2) private BigDecimal overallScore = BigDecimal.ZERO;
    @Column(columnDefinition = "text") private String strengths;
    @Column(columnDefinition = "text") private String improvements;
    @Column(columnDefinition = "text") private String feedback;
    @Column(nullable = false, length = 30) private String status = "SUBMITTED";
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public ProjectEvaluation() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getProjectId() { return projectId; } public void setProjectId(UUID v) { this.projectId = v; }
    public UUID getTeamId() { return teamId; } public void setTeamId(UUID v) { this.teamId = v; }
    public UUID getEvaluatorId() { return evaluatorId; } public void setEvaluatorId(UUID v) { this.evaluatorId = v; }
    public String getEvaluatorType() { return evaluatorType; } public void setEvaluatorType(String v) { this.evaluatorType = v; }
    public Integer getTechnicalQuality() { return technicalQuality; } public void setTechnicalQuality(Integer v) { this.technicalQuality = v; }
    public Integer getInnovation() { return innovation; } public void setInnovation(Integer v) { this.innovation = v; }
    public Integer getCodeQuality() { return codeQuality; } public void setCodeQuality(Integer v) { this.codeQuality = v; }
    public Integer getDocumentation() { return documentation; } public void setDocumentation(Integer v) { this.documentation = v; }
    public Integer getPresentation() { return presentation; } public void setPresentation(Integer v) { this.presentation = v; }
    public Integer getProblemSolving() { return problemSolving; } public void setProblemSolving(Integer v) { this.problemSolving = v; }
    public Integer getTeamwork() { return teamwork; } public void setTeamwork(Integer v) { this.teamwork = v; }
    public BigDecimal getOverallScore() { return overallScore; } public void setOverallScore(BigDecimal v) { this.overallScore = v; }
    public String getStrengths() { return strengths; } public void setStrengths(String v) { this.strengths = v; }
    public String getImprovements() { return improvements; } public void setImprovements(String v) { this.improvements = v; }
    public String getFeedback() { return feedback; } public void setFeedback(String v) { this.feedback = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
