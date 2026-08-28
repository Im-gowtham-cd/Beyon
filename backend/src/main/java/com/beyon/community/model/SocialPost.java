package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "social_posts")
public class SocialPost {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "author_id", nullable = false) private UUID authorId;
    @Column(name = "author_type", nullable = false, length = 30) private String authorType;
    @Column(name = "post_type", nullable = false, length = 30) private String postType = "TEXT";
    @Column(length = 300) private String title;
    @Column(columnDefinition = "text", nullable = false) private String content;
    @Column(name = "media_urls", columnDefinition = "text") private String mediaUrls = "[]";
    @Column(name = "reference_type", length = 50) private String referenceType;
    @Column(name = "reference_id") private UUID referenceId;
    @Column(name = "like_count", nullable = false) private Integer likeCount = 0;
    @Column(name = "comment_count", nullable = false) private Integer commentCount = 0;
    @Column(name = "share_count", nullable = false) private Integer shareCount = 0;
    @Column(nullable = false, length = 20) private String visibility = "PUBLIC";
    @Column(name = "is_pinned", nullable = false) private Boolean isPinned = false;
    @Column(columnDefinition = "text") private String tags = "[]";
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public SocialPost() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getAuthorId() { return authorId; } public void setAuthorId(UUID v) { this.authorId = v; }
    public String getAuthorType() { return authorType; } public void setAuthorType(String v) { this.authorType = v; }
    public String getPostType() { return postType; } public void setPostType(String v) { this.postType = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getContent() { return content; } public void setContent(String v) { this.content = v; }
    public String getMediaUrls() { return mediaUrls; } public void setMediaUrls(String v) { this.mediaUrls = v; }
    public String getReferenceType() { return referenceType; } public void setReferenceType(String v) { this.referenceType = v; }
    public UUID getReferenceId() { return referenceId; } public void setReferenceId(UUID v) { this.referenceId = v; }
    public Integer getLikeCount() { return likeCount; } public void setLikeCount(Integer v) { this.likeCount = v; }
    public Integer getCommentCount() { return commentCount; } public void setCommentCount(Integer v) { this.commentCount = v; }
    public Integer getShareCount() { return shareCount; } public void setShareCount(Integer v) { this.shareCount = v; }
    public String getVisibility() { return visibility; } public void setVisibility(String v) { this.visibility = v; }
    public Boolean getIsPinned() { return isPinned; } public void setIsPinned(Boolean v) { this.isPinned = v; }
    public String getTags() { return tags; } public void setTags(String v) { this.tags = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
