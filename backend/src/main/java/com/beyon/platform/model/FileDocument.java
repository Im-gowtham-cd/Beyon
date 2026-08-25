package com.beyon.platform.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "file_documents")
public class FileDocument {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "file_type", nullable = false, length = 50) private String fileType;
    @Column(name = "original_name", nullable = false, length = 300) private String originalName;
    @Column(name = "storage_path", nullable = false, length = 500) private String storagePath;
    @Column(name = "mime_type", length = 100) private String mimeType;
    @Column(name = "file_size", nullable = false) private Long fileSize = 0L;
    @Column(name = "is_public", nullable = false) private Boolean isPublic = false;
    @Column(columnDefinition = "jsonb") private String metadata;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public FileDocument() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getUserId() { return userId; } public void setUserId(UUID v) { this.userId = v; }
    public String getFileType() { return fileType; } public void setFileType(String v) { this.fileType = v; }
    public String getOriginalName() { return originalName; } public void setOriginalName(String v) { this.originalName = v; }
    public String getStoragePath() { return storagePath; } public void setStoragePath(String v) { this.storagePath = v; }
    public String getMimeType() { return mimeType; } public void setMimeType(String v) { this.mimeType = v; }
    public Long getFileSize() { return fileSize; } public void setFileSize(Long v) { this.fileSize = v; }
    public Boolean getIsPublic() { return isPublic; } public void setIsPublic(Boolean v) { this.isPublic = v; }
    public String getMetadata() { return metadata; } public void setMetadata(String v) { this.metadata = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
