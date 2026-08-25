package com.beyon.platform.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "content_resources")
public class ContentResource {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "author_id", nullable = false) private UUID authorId;
    @Column(name = "resource_type", nullable = false, length = 30) private String resourceType;
    @Column(nullable = false, length = 300) private String title;
    @Column(columnDefinition = "text") private String description;
    @Column(length = 500) private String url;
    @Column(name = "thumbnail_url", length = 500) private String thumbnailUrl;
    @Column(columnDefinition = "UUID[]") private UUID[] skillIds;
    @Column(length = 20) private String difficulty;
    @Column(name = "is_free", nullable = false) private Boolean isFree = true;
    @Column(name = "view_count", nullable = false) private Integer viewCount = 0;
    @Column(name = "bookmark_count", nullable = false) private Integer bookmarkCount = 0;
    @Column(precision = 2, scale = 1) private BigDecimal rating;
    @Column(columnDefinition = "jsonb") private String tags = "[]";
    @Column(nullable = false, length = 20) private String status = "PUBLISHED";
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public ContentResource() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getAuthorId() { return authorId; } public void setAuthorId(UUID v) { this.authorId = v; }
    public String getResourceType() { return resourceType; } public void setResourceType(String v) { this.resourceType = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public String getUrl() { return url; } public void setUrl(String v) { this.url = v; }
    public String getThumbnailUrl() { return thumbnailUrl; } public void setThumbnailUrl(String v) { this.thumbnailUrl = v; }
    public UUID[] getSkillIds() { return skillIds; } public void setSkillIds(UUID[] v) { this.skillIds = v; }
    public String getDifficulty() { return difficulty; } public void setDifficulty(String v) { this.difficulty = v; }
    public Boolean getIsFree() { return isFree; } public void setIsFree(Boolean v) { this.isFree = v; }
    public Integer getViewCount() { return viewCount; } public void setViewCount(Integer v) { this.viewCount = v; }
    public Integer getBookmarkCount() { return bookmarkCount; } public void setBookmarkCount(Integer v) { this.bookmarkCount = v; }
    public BigDecimal getRating() { return rating; } public void setRating(BigDecimal v) { this.rating = v; }
    public String getTags() { return tags; } public void setTags(String v) { this.tags = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
