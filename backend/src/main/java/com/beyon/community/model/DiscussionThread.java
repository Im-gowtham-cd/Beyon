package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "discussion_threads")
public class DiscussionThread {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "category_id", nullable = false) private UUID categoryId;
    @Column(name = "author_id", nullable = false) private UUID authorId;
    @Column(nullable = false, length = 300) private String title;
    @Column(columnDefinition = "text", nullable = false) private String content;
    @Column(columnDefinition = "text") private String tags = "[]";
    @Column(name = "reply_count", nullable = false) private Integer replyCount = 0;
    @Column(name = "view_count", nullable = false) private Integer viewCount = 0;
    @Column(name = "like_count", nullable = false) private Integer likeCount = 0;
    @Column(name = "is_pinned", nullable = false) private Boolean isPinned = false;
    @Column(name = "is_locked", nullable = false) private Boolean isLocked = false;
    @Column(nullable = false) private Boolean solved = false;
    @Column(name = "last_reply_at") private OffsetDateTime lastReplyAt;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public DiscussionThread() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getCategoryId() { return categoryId; } public void setCategoryId(UUID v) { this.categoryId = v; }
    public UUID getAuthorId() { return authorId; } public void setAuthorId(UUID v) { this.authorId = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getContent() { return content; } public void setContent(String v) { this.content = v; }
    public String getTags() { return tags; } public void setTags(String v) { this.tags = v; }
    public Integer getReplyCount() { return replyCount; } public void setReplyCount(Integer v) { this.replyCount = v; }
    public Integer getViewCount() { return viewCount; } public void setViewCount(Integer v) { this.viewCount = v; }
    public Integer getLikeCount() { return likeCount; } public void setLikeCount(Integer v) { this.likeCount = v; }
    public Boolean getIsPinned() { return isPinned; } public void setIsPinned(Boolean v) { this.isPinned = v; }
    public Boolean getIsLocked() { return isLocked; } public void setIsLocked(Boolean v) { this.isLocked = v; }
    public Boolean getSolved() { return solved; } public void setSolved(Boolean v) { this.solved = v; }
    public OffsetDateTime getLastReplyAt() { return lastReplyAt; } public void setLastReplyAt(OffsetDateTime v) { this.lastReplyAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
