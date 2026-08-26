package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "feedback_internal_notes")
public class FeedbackInternalNote {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "report_id", nullable = false) private UUID reportId;
    @Column(name = "author_id", nullable = false) private UUID authorId;
    @Column(columnDefinition = "text", nullable = false) private String content;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public FeedbackInternalNote() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getReportId() { return reportId; } public void setReportId(UUID v) { this.reportId = v; }
    public UUID getAuthorId() { return authorId; } public void setAuthorId(UUID v) { this.authorId = v; }
    public String getContent() { return content; } public void setContent(String v) { this.content = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
