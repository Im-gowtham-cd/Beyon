package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "advisor_chat_sessions")
public class AdvisorChatSession {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(length = 300) private String title = "Career Advice";
    @Column(nullable = false, length = 20) private String status = "ACTIVE";
    @Column(columnDefinition = "jsonb") private String contextSnapshot;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public AdvisorChatSession() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public String getContextSnapshot() { return contextSnapshot; } public void setContextSnapshot(String v) { this.contextSnapshot = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
