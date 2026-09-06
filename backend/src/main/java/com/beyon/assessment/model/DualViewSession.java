package com.beyon.assessment.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "proctoring_sessions")
public class DualViewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "assessment_session_id", nullable = false, unique = true, length = 36)
    private UUID assessmentSessionId;

    @Column(name = "candidate_id", nullable = false, length = 36)
    private UUID candidateId;

    @Column(name = "opportunity_id", length = 36)
    private UUID opportunityId;

    @Column(nullable = false, length = 30)
    private String status = "INITIALIZING";

    @Column(name = "mobile_paired", nullable = false)
    private Boolean mobilePaired = false;

    @Column(name = "mobile_device_id", length = 36)
    private UUID mobileDeviceId;

    @Column(name = "laptop_camera_health", length = 20)
    private String laptopCameraHealth = "UNKNOWN";

    @Column(name = "mobile_camera_health", length = 20)
    private String mobileCameraHealth = "UNKNOWN";

    @Column(name = "laptop_mic_health", length = 20)
    private String laptopMicHealth = "UNKNOWN";

    @Column(name = "mobile_mic_health", length = 20)
    private String mobileMicHealth = "UNKNOWN";

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore = 0;

    @Column(name = "risk_level", nullable = false, length = 20)
    private String riskLevel = "NORMAL";

    @Column(name = "review_required", nullable = false)
    private Boolean reviewRequired = false;

    @Column(name = "reviewer_decision", length = 30)
    private String reviewerDecision;

    @Column(name = "reviewer_id", length = 36)
    private UUID reviewerId;

    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;

    @Column(name = "review_notes", columnDefinition = "text")
    private String reviewNotes;

    @Column(name = "consent_given", nullable = false)
    private Boolean consentGiven = false;

    @Column(name = "consent_at")
    private OffsetDateTime consentAt;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public DualViewSession() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getAssessmentSessionId() { return assessmentSessionId; }
    public void setAssessmentSessionId(UUID v) { this.assessmentSessionId = v; }
    public UUID getCandidateId() { return candidateId; }
    public void setCandidateId(UUID v) { this.candidateId = v; }
    public UUID getOpportunityId() { return opportunityId; }
    public void setOpportunityId(UUID v) { this.opportunityId = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public Boolean getMobilePaired() { return mobilePaired; }
    public void setMobilePaired(Boolean v) { this.mobilePaired = v; }
    public UUID getMobileDeviceId() { return mobileDeviceId; }
    public void setMobileDeviceId(UUID v) { this.mobileDeviceId = v; }
    public String getLaptopCameraHealth() { return laptopCameraHealth; }
    public void setLaptopCameraHealth(String v) { this.laptopCameraHealth = v; }
    public String getMobileCameraHealth() { return mobileCameraHealth; }
    public void setMobileCameraHealth(String v) { this.mobileCameraHealth = v; }
    public String getLaptopMicHealth() { return laptopMicHealth; }
    public void setLaptopMicHealth(String v) { this.laptopMicHealth = v; }
    public String getMobileMicHealth() { return mobileMicHealth; }
    public void setMobileMicHealth(String v) { this.mobileMicHealth = v; }
    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer v) { this.riskScore = v; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String v) { this.riskLevel = v; }
    public Boolean getReviewRequired() { return reviewRequired; }
    public void setReviewRequired(Boolean v) { this.reviewRequired = v; }
    public String getReviewerDecision() { return reviewerDecision; }
    public void setReviewerDecision(String v) { this.reviewerDecision = v; }
    public UUID getReviewerId() { return reviewerId; }
    public void setReviewerId(UUID v) { this.reviewerId = v; }
    public OffsetDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(OffsetDateTime v) { this.reviewedAt = v; }
    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String v) { this.reviewNotes = v; }
    public Boolean getConsentGiven() { return consentGiven; }
    public void setConsentGiven(Boolean v) { this.consentGiven = v; }
    public OffsetDateTime getConsentAt() { return consentAt; }
    public void setConsentAt(OffsetDateTime v) { this.consentAt = v; }
    public OffsetDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(OffsetDateTime v) { this.startedAt = v; }
    public OffsetDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(OffsetDateTime v) { this.completedAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}

