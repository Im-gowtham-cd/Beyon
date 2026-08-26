package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "personalized_feed_items")
public class PersonalizedFeedItem {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "item_type", nullable = false, length = 50) private String itemType;
    @Column(nullable = false, length = 200) private String title;
    @Column(columnDefinition = "text") private String description;
    @Column(name = "action_url", length = 500) private String actionUrl;
    @Column(name = "action_label", length = 100) private String actionLabel;
    @Column(columnDefinition = "jsonb") private String metadata;
    @Column(name = "relevance_score", nullable = false) private BigDecimal relevanceScore = BigDecimal.ZERO;
    @Column(nullable = false) private Boolean dismissed = false;
    @Column(name = "created_at") private OffsetDateTime createdAt;

    @PrePersist void onCreate() { createdAt = OffsetDateTime.now(); }

    public PersonalizedFeedItem() {}

    public UUID getId() { return id; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public String getItemType() { return itemType; } public void setItemType(String v) { this.itemType = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public String getActionUrl() { return actionUrl; } public void setActionUrl(String v) { this.actionUrl = v; }
    public String getActionLabel() { return actionLabel; } public void setActionLabel(String v) { this.actionLabel = v; }
    public String getMetadata() { return metadata; } public void setMetadata(String v) { this.metadata = v; }
    public BigDecimal getRelevanceScore() { return relevanceScore; } public void setRelevanceScore(BigDecimal v) { this.relevanceScore = v; }
    public Boolean getDismissed() { return dismissed; } public void setDismissed(Boolean v) { this.dismissed = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
