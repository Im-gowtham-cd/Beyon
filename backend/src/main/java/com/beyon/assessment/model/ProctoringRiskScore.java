package com.beyon.assessment.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "proctoring_risk_scores")
public class ProctoringRiskScore {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "proctoring_session_id", nullable = false, length = 36)
    private UUID proctoringSessionId;

    @Column(nullable = false)
    private Integer score = 0;

    @Column(nullable = false, length = 20)
    private String level = "NORMAL";

    @Column(nullable = false)
    private Integer delta = 0;

    @Column(name = "contributing_event", length = 60)
    private String contributingEvent;

    @Column(name = "recorded_at", nullable = false)
    private OffsetDateTime recordedAt = OffsetDateTime.now();

    public ProctoringRiskScore() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getProctoringSessionId() { return proctoringSessionId; }
    public void setProctoringSessionId(UUID v) { this.proctoringSessionId = v; }
    public Integer getScore() { return score; }
    public void setScore(Integer v) { this.score = v; }
    public String getLevel() { return level; }
    public void setLevel(String v) { this.level = v; }
    public Integer getDelta() { return delta; }
    public void setDelta(Integer v) { this.delta = v; }
    public String getContributingEvent() { return contributingEvent; }
    public void setContributingEvent(String v) { this.contributingEvent = v; }
    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime v) { this.recordedAt = v; }
}

