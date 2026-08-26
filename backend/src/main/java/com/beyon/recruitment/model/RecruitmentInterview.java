package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "recruitment_interviews")
public class RecruitmentInterview {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "drive_id", nullable = false) private UUID driveId;
    @Column(name = "pipeline_id", nullable = false) private UUID pipelineId;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "interviewer_id") private UUID interviewerId;
    @Column(name = "interview_type", nullable = false, length = 50) private String interviewType;
    @Column(name = "round_number", nullable = false) private Integer roundNumber = 1;
    @Column(name = "scheduled_at") private OffsetDateTime scheduledAt;
    @Column(name = "duration_minutes") private Integer durationMinutes = 60;
    @Column(name = "meeting_link", length = 500) private String meetingLink;
    @Column(length = 300) private String location;
    @Column(nullable = false, length = 30) private String status = "SCHEDULED";
    @Column(columnDefinition = "text") private String feedback;
    @Column(precision = 5, scale = 2) private BigDecimal score;
    @Column(length = 30) private String recommendation;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public RecruitmentInterview() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getDriveId() { return driveId; } public void setDriveId(UUID v) { this.driveId = v; }
    public UUID getPipelineId() { return pipelineId; } public void setPipelineId(UUID v) { this.pipelineId = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getInterviewerId() { return interviewerId; } public void setInterviewerId(UUID v) { this.interviewerId = v; }
    public String getInterviewType() { return interviewType; } public void setInterviewType(String v) { this.interviewType = v; }
    public Integer getRoundNumber() { return roundNumber; } public void setRoundNumber(Integer v) { this.roundNumber = v; }
    public OffsetDateTime getScheduledAt() { return scheduledAt; } public void setScheduledAt(OffsetDateTime v) { this.scheduledAt = v; }
    public Integer getDurationMinutes() { return durationMinutes; } public void setDurationMinutes(Integer v) { this.durationMinutes = v; }
    public String getMeetingLink() { return meetingLink; } public void setMeetingLink(String v) { this.meetingLink = v; }
    public String getLocation() { return location; } public void setLocation(String v) { this.location = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public String getFeedback() { return feedback; } public void setFeedback(String v) { this.feedback = v; }
    public BigDecimal getScore() { return score; } public void setScore(BigDecimal v) { this.score = v; }
    public String getRecommendation() { return recommendation; } public void setRecommendation(String v) { this.recommendation = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
