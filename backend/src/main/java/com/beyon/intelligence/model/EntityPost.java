package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "entity_posts")
public class EntityPost {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "entity_id", nullable = false) private UUID entityId;
    @Column(name = "entity_type", nullable = false, length = 30) private String entityType;
    @Column(name = "post_type", nullable = false, length = 30) private String postType;
    @Column(length = 300) private String title;
    @Column(columnDefinition = "text", nullable = false) private String content;
    @Column(name = "action_url", length = 500) private String actionUrl;
    @Column(name = "like_count", nullable = false) private Integer likeCount = 0;
    @Column(name = "comment_count", nullable = false) private Integer commentCount = 0;
    @Column(nullable = false, length = 20) private String visibility = "PUBLIC";
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public EntityPost() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getEntityId() { return entityId; } public void setEntityId(UUID v) { this.entityId = v; }
    public String getEntityType() { return entityType; } public void setEntityType(String v) { this.entityType = v; }
    public String getPostType() { return postType; } public void setPostType(String v) { this.postType = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getContent() { return content; } public void setContent(String v) { this.content = v; }
    public String getActionUrl() { return actionUrl; } public void setActionUrl(String v) { this.actionUrl = v; }
    public Integer getLikeCount() { return likeCount; } public void setLikeCount(Integer v) { this.likeCount = v; }
    public Integer getCommentCount() { return commentCount; } public void setCommentCount(Integer v) { this.commentCount = v; }
    public String getVisibility() { return visibility; } public void setVisibility(String v) { this.visibility = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
