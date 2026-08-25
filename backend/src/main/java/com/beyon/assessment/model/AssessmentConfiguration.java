package com.beyon.assessment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "assessment_configurations")
public class AssessmentConfiguration {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "company_id", nullable = false) private UUID companyId;
    @Column(nullable = false, length = 300) private String title;
    @Column(columnDefinition = "text") private String description;
    @Column(name = "duration_minutes", nullable = false) private Integer durationMinutes = 60;
    @Column(name = "total_questions", nullable = false) private Integer totalQuestions = 0;
    @Column(name = "passing_score", nullable = false, precision = 5, scale = 2) private BigDecimal passingScore = new BigDecimal("60");
    @Column(name = "negative_marking", nullable = false) private Boolean negativeMarking = false;
    @Column(name = "negative_marks", precision = 3, scale = 2) private BigDecimal negativeMarks;
    @Column(name = "randomize_questions", nullable = false) private Boolean randomizeQuestions = true;
    @Column(name = "randomize_options", nullable = false) private Boolean randomizeOptions = false;
    @Column(name = "section_wise_time", nullable = false) private Boolean sectionWiseTime = false;
    @Column(name = "attempt_limit", nullable = false) private Integer attemptLimit = 1;
    @Column(name = "coin_cost", nullable = false) private Integer coinCost = 0;
    @Column(name = "adaptive_enabled", nullable = false) private Boolean adaptiveEnabled = false;
    @Column(nullable = false, length = 20) private String status = "DRAFT";
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public AssessmentConfiguration() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getCompanyId() { return companyId; } public void setCompanyId(UUID v) { this.companyId = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public Integer getDurationMinutes() { return durationMinutes; } public void setDurationMinutes(Integer v) { this.durationMinutes = v; }
    public Integer getTotalQuestions() { return totalQuestions; } public void setTotalQuestions(Integer v) { this.totalQuestions = v; }
    public BigDecimal getPassingScore() { return passingScore; } public void setPassingScore(BigDecimal v) { this.passingScore = v; }
    public Boolean getNegativeMarking() { return negativeMarking; } public void setNegativeMarking(Boolean v) { this.negativeMarking = v; }
    public BigDecimal getNegativeMarks() { return negativeMarks; } public void setNegativeMarks(BigDecimal v) { this.negativeMarks = v; }
    public Boolean getRandomizeQuestions() { return randomizeQuestions; } public void setRandomizeQuestions(Boolean v) { this.randomizeQuestions = v; }
    public Boolean getRandomizeOptions() { return randomizeOptions; } public void setRandomizeOptions(Boolean v) { this.randomizeOptions = v; }
    public Boolean getSectionWiseTime() { return sectionWiseTime; } public void setSectionWiseTime(Boolean v) { this.sectionWiseTime = v; }
    public Integer getAttemptLimit() { return attemptLimit; } public void setAttemptLimit(Integer v) { this.attemptLimit = v; }
    public Integer getCoinCost() { return coinCost; } public void setCoinCost(Integer v) { this.coinCost = v; }
    public Boolean getAdaptiveEnabled() { return adaptiveEnabled; } public void setAdaptiveEnabled(Boolean v) { this.adaptiveEnabled = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
