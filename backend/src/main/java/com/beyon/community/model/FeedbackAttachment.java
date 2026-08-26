package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "feedback_attachments")
public class FeedbackAttachment {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "report_id", nullable = false) private UUID reportId;
    @Column(name = "file_name", nullable = false, length = 300) private String fileName;
    @Column(name = "file_type", length = 100) private String fileType;
    @Column(name = "file_size", nullable = false) private Long fileSize = 0L;
    @Column(name = "storage_path", nullable = false, length = 500) private String storagePath;
    @Column(name = "uploaded_by", nullable = false) private UUID uploadedBy;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public FeedbackAttachment() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getReportId() { return reportId; } public void setReportId(UUID v) { this.reportId = v; }
    public String getFileName() { return fileName; } public void setFileName(String v) { this.fileName = v; }
    public String getFileType() { return fileType; } public void setFileType(String v) { this.fileType = v; }
    public Long getFileSize() { return fileSize; } public void setFileSize(Long v) { this.fileSize = v; }
    public String getStoragePath() { return storagePath; } public void setStoragePath(String v) { this.storagePath = v; }
    public UUID getUploadedBy() { return uploadedBy; } public void setUploadedBy(UUID v) { this.uploadedBy = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
