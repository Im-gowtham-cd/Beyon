package com.beyon.assessment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "identity_verifications")
public class IdentityVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(nullable = false, length = 30)
    private String status = "PENDING";

    @Column(name = "camera_capture_url", length = 500)
    private String cameraCaptureUrl;

    @Column(name = "face_detected")
    private Boolean faceDetected;

    @Column(name = "face_count")
    private Integer faceCount = 0;

    @Column(name = "liveness_score", precision = 3, scale = 2)
    private BigDecimal livenessScore;

    @Column(name = "verification_method", length = 30)
    private String verificationMethod = "FACE_MATCH";

    @Column(name = "verified_at")
    private OffsetDateTime verifiedAt;

    @Column(columnDefinition = "jsonb")
    private String metadata;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public IdentityVerification() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCameraCaptureUrl() { return cameraCaptureUrl; }
    public void setCameraCaptureUrl(String v) { this.cameraCaptureUrl = v; }
    public Boolean getFaceDetected() { return faceDetected; }
    public void setFaceDetected(Boolean v) { this.faceDetected = v; }
    public Integer getFaceCount() { return faceCount; }
    public void setFaceCount(Integer v) { this.faceCount = v; }
    public BigDecimal getLivenessScore() { return livenessScore; }
    public void setLivenessScore(BigDecimal v) { this.livenessScore = v; }
    public String getVerificationMethod() { return verificationMethod; }
    public void setVerificationMethod(String v) { this.verificationMethod = v; }
    public OffsetDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(OffsetDateTime v) { this.verifiedAt = v; }
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
