package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "placement_records")
public class PlacementRecord {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "company_user_id", nullable = false) private UUID companyUserId;
    @Column(name = "institution_id") private UUID institutionId;
    @Column(name = "drive_id") private UUID driveId;
    @Column(name = "pipeline_id") private UUID pipelineId;
    @Column(name = "job_role", nullable = false, length = 200) private String jobRole;
    @Column(name = "ctc_amount", precision = 12, scale = 2) private BigDecimal ctcAmount;
    @Column(name = "ctc_currency", length = 10) private String ctcCurrency = "INR";
    @Column(name = "company_tier", length = 10) private String companyTier;
    @Column(name = "placement_type", length = 30) private String placementType = "FULL_TIME";
    @Column(name = "placement_year", nullable = false) private Integer placementYear;
    @Column(name = "joining_date") private LocalDate joiningDate;
    @Column(name = "offer_date") private OffsetDateTime offerDate;
    @Column(nullable = false, length = 30) private String status = "OFFERED";
    @Column(nullable = false) private Boolean verified = false;
    @Column(name = "verified_by") private UUID verifiedBy;
    @Column(name = "verified_at") private OffsetDateTime verifiedAt;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public PlacementRecord() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getCompanyUserId() { return companyUserId; } public void setCompanyUserId(UUID v) { this.companyUserId = v; }
    public UUID getInstitutionId() { return institutionId; } public void setInstitutionId(UUID v) { this.institutionId = v; }
    public UUID getDriveId() { return driveId; } public void setDriveId(UUID v) { this.driveId = v; }
    public UUID getPipelineId() { return pipelineId; } public void setPipelineId(UUID v) { this.pipelineId = v; }
    public String getJobRole() { return jobRole; } public void setJobRole(String v) { this.jobRole = v; }
    public BigDecimal getCtcAmount() { return ctcAmount; } public void setCtcAmount(BigDecimal v) { this.ctcAmount = v; }
    public String getCtcCurrency() { return ctcCurrency; } public void setCtcCurrency(String v) { this.ctcCurrency = v; }
    public String getCompanyTier() { return companyTier; } public void setCompanyTier(String v) { this.companyTier = v; }
    public String getPlacementType() { return placementType; } public void setPlacementType(String v) { this.placementType = v; }
    public Integer getPlacementYear() { return placementYear; } public void setPlacementYear(Integer v) { this.placementYear = v; }
    public LocalDate getJoiningDate() { return joiningDate; } public void setJoiningDate(LocalDate v) { this.joiningDate = v; }
    public OffsetDateTime getOfferDate() { return offerDate; } public void setOfferDate(OffsetDateTime v) { this.offerDate = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public Boolean getVerified() { return verified; } public void setVerified(Boolean v) { this.verified = v; }
    public UUID getVerifiedBy() { return verifiedBy; } public void setVerifiedBy(UUID v) { this.verifiedBy = v; }
    public OffsetDateTime getVerifiedAt() { return verifiedAt; } public void setVerifiedAt(OffsetDateTime v) { this.verifiedAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
