package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "social_comments")
public class SocialComment {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "post_id", nullable = false) private UUID postId;
    @Column(name = "author_id", nullable = false) private UUID authorId;
    @Column(name = "parent_comment_id") private UUID parentCommentId;
    @Column(columnDefinition = "text", nullable = false) private String content;
    @Column(name = "like_count", nullable = false) private Integer likeCount = 0;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public SocialComment() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getPostId() { return postId; } public void setPostId(UUID v) { this.postId = v; }
    public UUID getAuthorId() { return authorId; } public void setAuthorId(UUID v) { this.authorId = v; }
    public UUID getParentCommentId() { return parentCommentId; } public void setParentCommentId(UUID v) { this.parentCommentId = v; }
    public String getContent() { return content; } public void setContent(String v) { this.content = v; }
    public Integer getLikeCount() { return likeCount; } public void setLikeCount(Integer v) { this.likeCount = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
