package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "interview_scorecards")
public class InterviewScorecard {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "schedule_id", nullable = false) private UUID scheduleId;
    @Column(name = "interviewer_id", nullable = false) private UUID interviewerId;
    @Column(columnDefinition = "text", nullable = false) private String scores = "{}";
    @Column(name = "overall_score", precision = 5, scale = 2) private BigDecimal overallScore;
    @Column(length = 30) private String recommendation;
    @Column(columnDefinition = "text") private String strengths;
    @Column(columnDefinition = "text") private String weaknesses;
    @Column(columnDefinition = "text") private String notes;
    @Column(name = "submitted_at") private OffsetDateTime submittedAt;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public InterviewScorecard() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getScheduleId() { return scheduleId; } public void setScheduleId(UUID v) { this.scheduleId = v; }
    public UUID getInterviewerId() { return interviewerId; } public void setInterviewerId(UUID v) { this.interviewerId = v; }
    public String getScores() { return scores; } public void setScores(String v) { this.scores = v; }
    public BigDecimal getOverallScore() { return overallScore; } public void setOverallScore(BigDecimal v) { this.overallScore = v; }
    public String getRecommendation() { return recommendation; } public void setRecommendation(String v) { this.recommendation = v; }
    public String getStrengths() { return strengths; } public void setStrengths(String v) { this.strengths = v; }
    public String getWeaknesses() { return weaknesses; } public void setWeaknesses(String v) { this.weaknesses = v; }
    public String getNotes() { return notes; } public void setNotes(String v) { this.notes = v; }
    public OffsetDateTime getSubmittedAt() { return submittedAt; } public void setSubmittedAt(OffsetDateTime v) { this.submittedAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
