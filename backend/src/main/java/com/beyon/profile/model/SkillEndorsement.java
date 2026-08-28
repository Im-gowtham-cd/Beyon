package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "skill_endorsements")
public class SkillEndorsement {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "skill_id", nullable = false) private UUID skillId;
    @Column(name = "endorser_id", nullable = false) private UUID endorserId;
    @Column(name = "endorser_name", length = 200) private String endorserName;
    @Column(name = "endorser_type", nullable = false, length = 50) private String endorserType;
    @Column(name = "endorsement_level", nullable = false, length = 30) private String endorsementLevel = "ENDORSED";
    @Column(name = "evidence_url", length = 500) private String evidenceUrl;
    @Column(name = "evidence_description", columnDefinition = "text") private String evidenceDescription;
    @Column(name = "valid_until") private OffsetDateTime validUntil;
    @Column(nullable = false, length = 30) private String status = "ACTIVE";
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public SkillEndorsement() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getSkillId() { return skillId; } public void setSkillId(UUID v) { this.skillId = v; }
    public UUID getEndorserId() { return endorserId; } public void setEndorserId(UUID v) { this.endorserId = v; }
    public String getEndorserName() { return endorserName; } public void setEndorserName(String v) { this.endorserName = v; }
    public String getEndorserType() { return endorserType; } public void setEndorserType(String v) { this.endorserType = v; }
    public String getEndorsementLevel() { return endorsementLevel; } public void setEndorsementLevel(String v) { this.endorsementLevel = v; }
    public String getEvidenceUrl() { return evidenceUrl; } public void setEvidenceUrl(String v) { this.evidenceUrl = v; }
    public String getEvidenceDescription() { return evidenceDescription; } public void setEvidenceDescription(String v) { this.evidenceDescription = v; }
    public OffsetDateTime getValidUntil() { return validUntil; } public void setValidUntil(OffsetDateTime v) { this.validUntil = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
