package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "collaboration_registrations")
public class CollaborationRegistration {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "program_id", nullable = false) private UUID programId;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(nullable = false, length = 30) private String status = "REGISTERED";
    @Column(columnDefinition = "text") private String feedback;
    @Column(precision = 2, scale = 1) private BigDecimal rating;
    @Column(name = "certificate_url", length = 500) private String certificateUrl;
    @Column(name = "registered_at", nullable = false) private OffsetDateTime registeredAt = OffsetDateTime.now();
    @Column(name = "completed_at") private OffsetDateTime completedAt;

    public CollaborationRegistration() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getProgramId() { return programId; } public void setProgramId(UUID v) { this.programId = v; }
    public UUID getUserId() { return userId; } public void setUserId(UUID v) { this.userId = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public String getFeedback() { return feedback; } public void setFeedback(String v) { this.feedback = v; }
    public BigDecimal getRating() { return rating; } public void setRating(BigDecimal v) { this.rating = v; }
    public String getCertificateUrl() { return certificateUrl; } public void setCertificateUrl(String v) { this.certificateUrl = v; }
    public OffsetDateTime getRegisteredAt() { return registeredAt; } public void setRegisteredAt(OffsetDateTime v) { this.registeredAt = v; }
    public OffsetDateTime getCompletedAt() { return completedAt; } public void setCompletedAt(OffsetDateTime v) { this.completedAt = v; }
}
