package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_members")
public class TeamMember {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "team_id", nullable = false) private UUID teamId;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(length = 100) private String role;
    @Column(name = "skills_brought", columnDefinition = "text") private String skillsBrought;
    @Column(nullable = false, length = 30) private String status = "PENDING";
    @Column(name = "joined_at", nullable = false) private OffsetDateTime joinedAt = OffsetDateTime.now();

    public TeamMember() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getTeamId() { return teamId; } public void setTeamId(UUID v) { this.teamId = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public String getRole() { return role; } public void setRole(String v) { this.role = v; }
    public String getSkillsBrought() { return skillsBrought; } public void setSkillsBrought(String v) { this.skillsBrought = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public OffsetDateTime getJoinedAt() { return joinedAt; } public void setJoinedAt(OffsetDateTime v) { this.joinedAt = v; }
}
