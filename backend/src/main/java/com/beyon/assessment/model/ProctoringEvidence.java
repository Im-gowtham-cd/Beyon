package com.beyon.assessment.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "proctoring_evidence")
public class ProctoringEvidence {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "incident_id", nullable = false, length = 36)
    private UUID incidentId;

    @Column(name = "evidence_type", nullable = false, length = 30)
    private String evidenceType;

    @Column(name = "device_source", nullable = false, length = 20)
    private String deviceSource;

    @Column(name = "storage_path", length = 500)
    private String storagePath;

    @Column(name = "storage_url", length = 500)
    private String storageUrl;

    @Column(name = "captured_at", nullable = false)
    private OffsetDateTime capturedAt;

    @Column(name = "window_before_ms", nullable = false)
    private Integer windowBeforeMs = 10000;

    @Column(name = "window_after_ms", nullable = false)
    private Integer windowAfterMs = 10000;

    @Column(name = "access_expires_at")
    private OffsetDateTime accessExpiresAt;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public ProctoringEvidence() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getIncidentId() { return incidentId; }
    public void setIncidentId(UUID v) { this.incidentId = v; }
    public String getEvidenceType() { return evidenceType; }
    public void setEvidenceType(String v) { this.evidenceType = v; }
    public String getDeviceSource() { return deviceSource; }
    public void setDeviceSource(String v) { this.deviceSource = v; }
    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String v) { this.storagePath = v; }
    public String getStorageUrl() { return storageUrl; }
    public void setStorageUrl(String v) { this.storageUrl = v; }
    public OffsetDateTime getCapturedAt() { return capturedAt; }
    public void setCapturedAt(OffsetDateTime v) { this.capturedAt = v; }
    public Integer getWindowBeforeMs() { return windowBeforeMs; }
    public void setWindowBeforeMs(Integer v) { this.windowBeforeMs = v; }
    public Integer getWindowAfterMs() { return windowAfterMs; }
    public void setWindowAfterMs(Integer v) { this.windowAfterMs = v; }
    public OffsetDateTime getAccessExpiresAt() { return accessExpiresAt; }
    public void setAccessExpiresAt(OffsetDateTime v) { this.accessExpiresAt = v; }
    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long v) { this.fileSizeBytes = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}

