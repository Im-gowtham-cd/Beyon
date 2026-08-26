package com.beyon.platform.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "platform_reports")
public class PlatformReport {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "report_type", nullable = false, length = 50) private String reportType;
    @Column(nullable = false, length = 300) private String title;
    @Column(nullable = false, columnDefinition = "jsonb") private String parameters = "{}";
    @Column(name = "file_url", length = 500) private String fileUrl;
    @Column(name = "generation_status", nullable = false, length = 30) private String generationStatus = "PENDING";
    @Column(nullable = false, length = 10) private String format = "PDF";
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "completed_at") private OffsetDateTime completedAt;

    public PlatformReport() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getUserId() { return userId; } public void setUserId(UUID v) { this.userId = v; }
    public String getReportType() { return reportType; } public void setReportType(String v) { this.reportType = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getParameters() { return parameters; } public void setParameters(String v) { this.parameters = v; }
    public String getFileUrl() { return fileUrl; } public void setFileUrl(String v) { this.fileUrl = v; }
    public String getGenerationStatus() { return generationStatus; } public void setGenerationStatus(String v) { this.generationStatus = v; }
    public String getFormat() { return format; } public void setFormat(String v) { this.format = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getCompletedAt() { return completedAt; } public void setCompletedAt(OffsetDateTime v) { this.completedAt = v; }
}
