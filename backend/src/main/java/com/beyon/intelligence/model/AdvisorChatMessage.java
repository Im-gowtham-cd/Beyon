package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "advisor_chat_messages")
public class AdvisorChatMessage {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "session_id", nullable = false) private UUID sessionId;
    @Column(nullable = false, length = 10) private String role;
    @Column(nullable = false, columnDefinition = "text") private String content;
    @Column(columnDefinition = "jsonb") private String dataReferences;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public AdvisorChatMessage() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getSessionId() { return sessionId; } public void setSessionId(UUID v) { this.sessionId = v; }
    public String getRole() { return role; } public void setRole(String v) { this.role = v; }
    public String getContent() { return content; } public void setContent(String v) { this.content = v; }
    public String getDataReferences() { return dataReferences; } public void setDataReferences(String v) { this.dataReferences = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
