package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "collaboration_programs")
public class CollaborationProgram {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "host_user_id", nullable = false) private UUID hostUserId;
    @Column(name = "host_type", nullable = false, length = 30) private String hostType;
    @Column(name = "program_type", nullable = false, length = 50) private String programType;
    @Column(nullable = false, length = 300) private String title;
    @Column(columnDefinition = "text") private String description;
    @Column(length = 200) private String topic;
    @Column(name = "target_skills", columnDefinition = "text") private String targetSkills = "[]";
    @Column(name = "target_audience", length = 30) private String targetAudience;
    @Column(name = "target_institution_ids", columnDefinition = "UUID[]") private UUID[] targetInstitutionIds;
    @Column(name = "target_departments", columnDefinition = "text") private String targetDepartments;
    @Column(name = "start_date") private OffsetDateTime startDate;
    @Column(name = "end_date") private OffsetDateTime endDate;
    @Column(name = "max_participants") private Integer maxParticipants;
    @Column(name = "current_participants", nullable = false) private Integer currentParticipants = 0;
    @Column(nullable = false, length = 30) private String status = "DRAFT";
    @Column(length = 500) private String location;
    @Column(name = "meeting_link", length = 500) private String meetingLink;
    @Column(columnDefinition = "text") private String prerequisites;
    @Column(name = "certificate_provided", nullable = false) private Boolean certificateProvided = false;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public CollaborationProgram() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getHostUserId() { return hostUserId; } public void setHostUserId(UUID v) { this.hostUserId = v; }
    public String getHostType() { return hostType; } public void setHostType(String v) { this.hostType = v; }
    public String getProgramType() { return programType; } public void setProgramType(String v) { this.programType = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public String getTopic() { return topic; } public void setTopic(String v) { this.topic = v; }
    public String getTargetSkills() { return targetSkills; } public void setTargetSkills(String v) { this.targetSkills = v; }
    public String getTargetAudience() { return targetAudience; } public void setTargetAudience(String v) { this.targetAudience = v; }
    public UUID[] getTargetInstitutionIds() { return targetInstitutionIds; } public void setTargetInstitutionIds(UUID[] v) { this.targetInstitutionIds = v; }
    public String getTargetDepartments() { return targetDepartments; } public void setTargetDepartments(String v) { this.targetDepartments = v; }
    public OffsetDateTime getStartDate() { return startDate; } public void setStartDate(OffsetDateTime v) { this.startDate = v; }
    public OffsetDateTime getEndDate() { return endDate; } public void setEndDate(OffsetDateTime v) { this.endDate = v; }
    public Integer getMaxParticipants() { return maxParticipants; } public void setMaxParticipants(Integer v) { this.maxParticipants = v; }
    public Integer getCurrentParticipants() { return currentParticipants; } public void setCurrentParticipants(Integer v) { this.currentParticipants = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public String getLocation() { return location; } public void setLocation(String v) { this.location = v; }
    public String getMeetingLink() { return meetingLink; } public void setMeetingLink(String v) { this.meetingLink = v; }
    public String getPrerequisites() { return prerequisites; } public void setPrerequisites(String v) { this.prerequisites = v; }
    public Boolean getCertificateProvided() { return certificateProvided; } public void setCertificateProvided(Boolean v) { this.certificateProvided = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
