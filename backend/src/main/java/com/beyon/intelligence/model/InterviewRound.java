package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "interview_rounds")
public class InterviewRound {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "opportunity_id", nullable = false) private UUID opportunityId;
    @Column(nullable = false, length = 200) private String name;
    @Column(name = "round_type", nullable = false, length = 50) private String roundType;
    @Column(name = "sort_order", nullable = false) private Integer sortOrder = 0;
    @Column(name = "duration_minutes", nullable = false) private Integer durationMinutes = 60;
    @Column(name = "max_score", nullable = false, precision = 5, scale = 2) private BigDecimal maxScore = new BigDecimal("100");
    @Column(columnDefinition = "text") private String description;
    @Column(name = "is eliminative", nullable = false) private Boolean isEliminative = true;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public InterviewRound() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getOpportunityId() { return opportunityId; } public void setOpportunityId(UUID v) { this.opportunityId = v; }
    public String getName() { return name; } public void setName(String v) { this.name = v; }
    public String getRoundType() { return roundType; } public void setRoundType(String v) { this.roundType = v; }
    public Integer getSortOrder() { return sortOrder; } public void setSortOrder(Integer v) { this.sortOrder = v; }
    public Integer getDurationMinutes() { return durationMinutes; } public void setDurationMinutes(Integer v) { this.durationMinutes = v; }
    public BigDecimal getMaxScore() { return maxScore; } public void setMaxScore(BigDecimal v) { this.maxScore = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public Boolean getIsEliminative() { return isEliminative; } public void setIsEliminative(Boolean v) { this.isEliminative = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
