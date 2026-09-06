package com.beyon.assessment.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "proctoring_policy_config")
public class ProctoringPolicyConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "opportunity_id", unique = true, length = 36)
    private UUID opportunityId;

    @Column(name = "company_user_id", nullable = false, length = 36)
    private UUID companyUserId;

    @Column(name = "risk_weights", columnDefinition = "text", nullable = false)
    private String riskWeights = "{}";

    @Column(name = "threshold_low_concern", nullable = false)
    private Integer thresholdLowConcern = 31;

    @Column(name = "threshold_suspicious", nullable = false)
    private Integer thresholdSuspicious = 51;

    @Column(name = "threshold_high_risk", nullable = false)
    private Integer thresholdHighRisk = 71;

    @Column(name = "threshold_critical", nullable = false)
    private Integer thresholdCritical = 86;

    @Column(name = "mobile_required", nullable = false)
    private Boolean mobileRequired = true;

    @Column(name = "mobile_grace_seconds", nullable = false)
    private Integer mobileGraceSeconds = 30;

    @Column(name = "evidence_window_seconds", nullable = false)
    private Integer evidenceWindowSeconds = 10;

    @Column(name = "auto_fail_enabled", nullable = false)
    private Boolean autoFailEnabled = false;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public ProctoringPolicyConfig() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getOpportunityId() { return opportunityId; }
    public void setOpportunityId(UUID v) { this.opportunityId = v; }
    public UUID getCompanyUserId() { return companyUserId; }
    public void setCompanyUserId(UUID v) { this.companyUserId = v; }
    public String getRiskWeights() { return riskWeights; }
    public void setRiskWeights(String v) { this.riskWeights = v; }
    public Integer getThresholdLowConcern() { return thresholdLowConcern; }
    public void setThresholdLowConcern(Integer v) { this.thresholdLowConcern = v; }
    public Integer getThresholdSuspicious() { return thresholdSuspicious; }
    public void setThresholdSuspicious(Integer v) { this.thresholdSuspicious = v; }
    public Integer getThresholdHighRisk() { return thresholdHighRisk; }
    public void setThresholdHighRisk(Integer v) { this.thresholdHighRisk = v; }
    public Integer getThresholdCritical() { return thresholdCritical; }
    public void setThresholdCritical(Integer v) { this.thresholdCritical = v; }
    public Boolean getMobileRequired() { return mobileRequired; }
    public void setMobileRequired(Boolean v) { this.mobileRequired = v; }
    public Integer getMobileGraceSeconds() { return mobileGraceSeconds; }
    public void setMobileGraceSeconds(Integer v) { this.mobileGraceSeconds = v; }
    public Integer getEvidenceWindowSeconds() { return evidenceWindowSeconds; }
    public void setEvidenceWindowSeconds(Integer v) { this.evidenceWindowSeconds = v; }
    public Boolean getAutoFailEnabled() { return autoFailEnabled; }
    public void setAutoFailEnabled(Boolean v) { this.autoFailEnabled = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
