package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "recruitment_pipelines")
public class RecruitmentPipeline {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "opportunity_id", nullable = false) private UUID opportunityId;
    @Column(name = "company_id", nullable = false) private UUID companyId;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "current_stage", nullable = false, length = 30) private String currentStage = "APPLIED";
    @Column(name = "assessment_result_id") private UUID assessmentResultId;
    @Column(name = "interview_round") private Integer interviewRound = 0;
    @Column(name = "overall_score", precision = 5, scale = 2) private BigDecimal overallScore;
    @Column(columnDefinition = "text") private String notes;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public RecruitmentPipeline() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getOpportunityId() { return opportunityId; } public void setOpportunityId(UUID v) { this.opportunityId = v; }
    public UUID getCompanyId() { return companyId; } public void setCompanyId(UUID v) { this.companyId = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public String getCurrentStage() { return currentStage; } public void setCurrentStage(String v) { this.currentStage = v; }
    public UUID getAssessmentResultId() { return assessmentResultId; } public void setAssessmentResultId(UUID v) { this.assessmentResultId = v; }
    public Integer getInterviewRound() { return interviewRound; } public void setInterviewRound(Integer v) { this.interviewRound = v; }
    public BigDecimal getOverallScore() { return overallScore; } public void setOverallScore(BigDecimal v) { this.overallScore = v; }
    public String getNotes() { return notes; } public void setNotes(String v) { this.notes = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
