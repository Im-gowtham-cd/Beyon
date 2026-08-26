package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "discussion_replies")
public class DiscussionReply {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "thread_id", nullable = false) private UUID threadId;
    @Column(name = "author_id", nullable = false) private UUID authorId;
    @Column(name = "parent_reply_id") private UUID parentReplyId;
    @Column(columnDefinition = "text", nullable = false) private String content;
    @Column(name = "like_count", nullable = false) private Integer likeCount = 0;
    @Column(name = "is_accepted_answer", nullable = false) private Boolean isAcceptedAnswer = false;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public DiscussionReply() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getThreadId() { return threadId; } public void setThreadId(UUID v) { this.threadId = v; }
    public UUID getAuthorId() { return authorId; } public void setAuthorId(UUID v) { this.authorId = v; }
    public UUID getParentReplyId() { return parentReplyId; } public void setParentReplyId(UUID v) { this.parentReplyId = v; }
    public String getContent() { return content; } public void setContent(String v) { this.content = v; }
    public Integer getLikeCount() { return likeCount; } public void setLikeCount(Integer v) { this.likeCount = v; }
    public Boolean getIsAcceptedAnswer() { return isAcceptedAnswer; } public void setIsAcceptedAnswer(Boolean v) { this.isAcceptedAnswer = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
