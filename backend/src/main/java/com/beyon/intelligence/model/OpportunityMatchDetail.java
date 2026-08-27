package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "opportunity_match_detail")
public class OpportunityMatchDetail {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "opportunity_id", nullable = false) private UUID opportunityId;
    @Column(name = "overall_match", nullable = false, precision = 5, scale = 2) private BigDecimal overallMatch = BigDecimal.ZERO;
    @Column(name = "skill_match", nullable = false, precision = 5, scale = 2) private BigDecimal skillMatch = BigDecimal.ZERO;
    @Column(name = "eligibility_met", nullable = false) private Boolean eligibilityMet = false;
    @Column(name = "experience_met", nullable = false) private Boolean experienceMet = false;
    @Column(name = "certification_met", nullable = false) private Boolean certificationMet = false;
    @Column(name = "coin_requirement_met", nullable = false) private Boolean coinRequirementMet = false;
    @Column(nullable = false, columnDefinition = "text") private String matchFactors = "[]";
    @Column(name = "strength_items", nullable = false, columnDefinition = "text") private String strengthItems = "[]";
    @Column(name = "gap_items", nullable = false, columnDefinition = "text") private String gapItems = "[]";
    @Column(name = "calculated_at", nullable = false) private OffsetDateTime calculatedAt = OffsetDateTime.now();
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public OpportunityMatchDetail() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getOpportunityId() { return opportunityId; } public void setOpportunityId(UUID v) { this.opportunityId = v; }
    public BigDecimal getOverallMatch() { return overallMatch; } public void setOverallMatch(BigDecimal v) { this.overallMatch = v; }
    public BigDecimal getSkillMatch() { return skillMatch; } public void setSkillMatch(BigDecimal v) { this.skillMatch = v; }
    public Boolean getEligibilityMet() { return eligibilityMet; } public void setEligibilityMet(Boolean v) { this.eligibilityMet = v; }
    public Boolean getExperienceMet() { return experienceMet; } public void setExperienceMet(Boolean v) { this.experienceMet = v; }
    public Boolean getCertificationMet() { return certificationMet; } public void setCertificationMet(Boolean v) { this.certificationMet = v; }
    public Boolean getCoinRequirementMet() { return coinRequirementMet; } public void setCoinRequirementMet(Boolean v) { this.coinRequirementMet = v; }
    public String getMatchFactors() { return matchFactors; } public void setMatchFactors(String v) { this.matchFactors = v; }
    public String getStrengthItems() { return strengthItems; } public void setStrengthItems(String v) { this.strengthItems = v; }
    public String getGapItems() { return gapItems; } public void setGapItems(String v) { this.gapItems = v; }
    public OffsetDateTime getCalculatedAt() { return calculatedAt; } public void setCalculatedAt(OffsetDateTime v) { this.calculatedAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
