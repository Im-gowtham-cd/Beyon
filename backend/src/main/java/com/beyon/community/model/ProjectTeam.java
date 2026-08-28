package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_teams")
public class ProjectTeam {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "project_id", nullable = false) private UUID projectId;
    @Column(nullable = false, length = 200) private String name;
    @Column(columnDefinition = "text") private String description;
    @Column(name = "leader_id", nullable = false) private UUID leaderId;
    @Column(name = "max_members", nullable = false) private Integer maxMembers = 4;
    @Column(name = "current_members", nullable = false) private Integer currentMembers = 1;
    @Column(nullable = false, length = 30) private String status = "FORMING";
    @Column(name = "looking_for", columnDefinition = "text") private String lookingFor;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public ProjectTeam() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getProjectId() { return projectId; } public void setProjectId(UUID v) { this.projectId = v; }
    public String getName() { return name; } public void setName(String v) { this.name = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public UUID getLeaderId() { return leaderId; } public void setLeaderId(UUID v) { this.leaderId = v; }
    public Integer getMaxMembers() { return maxMembers; } public void setMaxMembers(Integer v) { this.maxMembers = v; }
    public Integer getCurrentMembers() { return currentMembers; } public void setCurrentMembers(Integer v) { this.currentMembers = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public String getLookingFor() { return lookingFor; } public void setLookingFor(String v) { this.lookingFor = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
