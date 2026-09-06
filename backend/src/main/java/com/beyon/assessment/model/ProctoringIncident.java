package com.beyon.assessment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "proctoring_incidents")
public class ProctoringIncident {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "proctoring_session_id", nullable = false, length = 36)
    private UUID proctoringSessionId;

    @Column(name = "incident_type", nullable = false, length = 60)
    private String incidentType;

    @Column(nullable = false, length = 20)
    private String severity; // LOW | MEDIUM | HIGH | CRITICAL

    @Column(nullable = false, precision = 4, scale = 3)
    private BigDecimal confidence = BigDecimal.ZERO;

    @Column(name = "risk_contribution", nullable = false)
    private Integer riskContribution = 0;

    @Column(name = "question_id", length = 36)
    private String questionId;

    @Column(length = 200)
    private String sources; // CSV: LAPTOP_CAMERA,MOBILE_CAMERA,LAPTOP_AUDIO,MOBILE_AUDIO

    @Column(name = "signal_count", nullable = false)
    private Integer signalCount = 1;

    @Column(name = "started_at", nullable = false)
    private OffsetDateTime startedAt;

    @Column(name = "ended_at")
    private OffsetDateTime endedAt;

    @Column(name = "reviewer_action", length = 30)
    private String reviewerAction;

    @Column(name = "reviewer_id", length = 36)
    private UUID reviewerId;

    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;

    @Column(name = "review_notes", columnDefinition = "text")
    private String reviewNotes;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public ProctoringIncident() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getProctoringSessionId() { return proctoringSessionId; }
    public void setProctoringSessionId(UUID v) { this.proctoringSessionId = v; }
    public String getIncidentType() { return incidentType; }
    public void setIncidentType(String v) { this.incidentType = v; }
    public String getSeverity() { return severity; }
    public void setSeverity(String v) { this.severity = v; }
    public BigDecimal getConfidence() { return confidence; }
    public void setConfidence(BigDecimal v) { this.confidence = v; }
    public Integer getRiskContribution() { return riskContribution; }
    public void setRiskContribution(Integer v) { this.riskContribution = v; }
    public String getQuestionId() { return questionId; }
    public void setQuestionId(String v) { this.questionId = v; }
    public String getSources() { return sources; }
    public void setSources(String v) { this.sources = v; }
    public Integer getSignalCount() { return signalCount; }
    public void setSignalCount(Integer v) { this.signalCount = v; }
    public OffsetDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(OffsetDateTime v) { this.startedAt = v; }
    public OffsetDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(OffsetDateTime v) { this.endedAt = v; }
    public String getReviewerAction() { return reviewerAction; }
    public void setReviewerAction(String v) { this.reviewerAction = v; }
    public UUID getReviewerId() { return reviewerId; }
    public void setReviewerId(UUID v) { this.reviewerId = v; }
    public OffsetDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(OffsetDateTime v) { this.reviewedAt = v; }
    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String v) { this.reviewNotes = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
