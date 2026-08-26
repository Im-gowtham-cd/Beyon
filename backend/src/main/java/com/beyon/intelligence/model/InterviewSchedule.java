package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "interview_schedules")
public class InterviewSchedule {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "application_id", nullable = false) private UUID applicationId;
    @Column(name = "round_id", nullable = false) private UUID roundId;
    @Column(name = "interviewer_id") private UUID interviewerId;
    @Column(name = "scheduled_at") private OffsetDateTime scheduledAt;
    @Column(name = "duration_minutes", nullable = false) private Integer durationMinutes = 60;
    @Column(length = 500) private String location;
    @Column(name = "meeting_link", length = 500) private String meetingLink;
    @Column(nullable = false, length = 30) private String status = "SCHEDULED";
    @Column(columnDefinition = "text") private String notes;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public InterviewSchedule() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getApplicationId() { return applicationId; } public void setApplicationId(UUID v) { this.applicationId = v; }
    public UUID getRoundId() { return roundId; } public void setRoundId(UUID v) { this.roundId = v; }
    public UUID getInterviewerId() { return interviewerId; } public void setInterviewerId(UUID v) { this.interviewerId = v; }
    public OffsetDateTime getScheduledAt() { return scheduledAt; } public void setScheduledAt(OffsetDateTime v) { this.scheduledAt = v; }
    public Integer getDurationMinutes() { return durationMinutes; } public void setDurationMinutes(Integer v) { this.durationMinutes = v; }
    public String getLocation() { return location; } public void setLocation(String v) { this.location = v; }
    public String getMeetingLink() { return meetingLink; } public void setMeetingLink(String v) { this.meetingLink = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public String getNotes() { return notes; } public void setNotes(String v) { this.notes = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
