package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "message_conversations")
public class MessageConversation {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "conversation_type", nullable = false, length = 20) private String conversationType = "DIRECT";
    @Column(length = 200) private String title;
    @Column(name = "last_message_at") private OffsetDateTime lastMessageAt;
    @Column(name = "last_message_preview", length = 500) private String lastMessagePreview;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public MessageConversation() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public String getConversationType() { return conversationType; } public void setConversationType(String v) { this.conversationType = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public OffsetDateTime getLastMessageAt() { return lastMessageAt; } public void setLastMessageAt(OffsetDateTime v) { this.lastMessageAt = v; }
    public String getLastMessagePreview() { return lastMessagePreview; } public void setLastMessagePreview(String v) { this.lastMessagePreview = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
