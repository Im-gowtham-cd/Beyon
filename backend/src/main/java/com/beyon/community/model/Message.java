package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages")
public class Message {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "conversation_id", nullable = false) private UUID conversationId;
    @Column(name = "sender_id", nullable = false) private UUID senderId;
    @Column(columnDefinition = "text", nullable = false) private String content;
    @Column(name = "message_type", nullable = false, length = 20) private String messageType = "TEXT";
    @Column(name = "attachment_url", length = 500) private String attachmentUrl;
    @Column(name = "is_edited", nullable = false) private Boolean isEdited = false;
    @Column(name = "is_deleted", nullable = false) private Boolean isDeleted = false;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public Message() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getConversationId() { return conversationId; } public void setConversationId(UUID v) { this.conversationId = v; }
    public UUID getSenderId() { return senderId; } public void setSenderId(UUID v) { this.senderId = v; }
    public String getContent() { return content; } public void setContent(String v) { this.content = v; }
    public String getMessageType() { return messageType; } public void setMessageType(String v) { this.messageType = v; }
    public String getAttachmentUrl() { return attachmentUrl; } public void setAttachmentUrl(String v) { this.attachmentUrl = v; }
    public Boolean getIsEdited() { return isEdited; } public void setIsEdited(Boolean v) { this.isEdited = v; }
    public Boolean getIsDeleted() { return isDeleted; } public void setIsDeleted(Boolean v) { this.isDeleted = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
