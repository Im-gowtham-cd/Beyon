package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "career_outcomes")
public class CareerOutcome {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "outcome_type", nullable = false, length = 30) private String outcomeType;
    @Column(name = "company_name", length = 200) private String companyName;
    @Column(length = 200) private String role;
    @Column(length = 200) private String institution;
    @Column(columnDefinition = "text") private String description;
    @Column(name = "start_date") private LocalDate startDate;
    @Column(name = "end_date") private LocalDate endDate;
    @Column(name = "is_current", nullable = false) private Boolean isCurrent = true;
    @Column(nullable = false) private Boolean verified = false;
    @Column(name = "verified_by") private UUID verifiedBy;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public CareerOutcome() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public String getOutcomeType() { return outcomeType; } public void setOutcomeType(String v) { this.outcomeType = v; }
    public String getCompanyName() { return companyName; } public void setCompanyName(String v) { this.companyName = v; }
    public String getRole() { return role; } public void setRole(String v) { this.role = v; }
    public String getInstitution() { return institution; } public void setInstitution(String v) { this.institution = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public LocalDate getStartDate() { return startDate; } public void setStartDate(LocalDate v) { this.startDate = v; }
    public LocalDate getEndDate() { return endDate; } public void setEndDate(LocalDate v) { this.endDate = v; }
    public Boolean getIsCurrent() { return isCurrent; } public void setIsCurrent(Boolean v) { this.isCurrent = v; }
    public Boolean getVerified() { return verified; } public void setVerified(Boolean v) { this.verified = v; }
    public UUID getVerifiedBy() { return verifiedBy; } public void setVerifiedBy(UUID v) { this.verifiedBy = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
