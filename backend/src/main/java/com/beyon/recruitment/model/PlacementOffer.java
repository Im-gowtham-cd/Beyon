package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "placement_offers")
public class PlacementOffer {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "pipeline_id", nullable = false) private UUID pipelineId;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "company_id", nullable = false) private UUID companyId;
    @Column(name = "job_role", nullable = false, length = 200) private String jobRole;
    @Column(name = "package_amount", precision = 12, scale = 2) private BigDecimal packageAmount;
    @Column(name = "package_currency", length = 10) private String packageCurrency = "INR";
    @Column(name = "company_tier", length = 10) private String companyTier;
    @Column(name = "offer_status", nullable = false, length = 20) private String offerStatus = "GENERATED";
    @Column(name = "offer_date") private OffsetDateTime offerDate;
    @Column(name = "acceptance_date") private OffsetDateTime acceptanceDate;
    @Column(name = "joining_date") private LocalDate joiningDate;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public PlacementOffer() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getPipelineId() { return pipelineId; } public void setPipelineId(UUID v) { this.pipelineId = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getCompanyId() { return companyId; } public void setCompanyId(UUID v) { this.companyId = v; }
    public String getJobRole() { return jobRole; } public void setJobRole(String v) { this.jobRole = v; }
    public BigDecimal getPackageAmount() { return packageAmount; } public void setPackageAmount(BigDecimal v) { this.packageAmount = v; }
    public String getPackageCurrency() { return packageCurrency; } public void setPackageCurrency(String v) { this.packageCurrency = v; }
    public String getCompanyTier() { return companyTier; } public void setCompanyTier(String v) { this.companyTier = v; }
    public String getOfferStatus() { return offerStatus; } public void setOfferStatus(String v) { this.offerStatus = v; }
    public OffsetDateTime getOfferDate() { return offerDate; } public void setOfferDate(OffsetDateTime v) { this.offerDate = v; }
    public OffsetDateTime getAcceptanceDate() { return acceptanceDate; } public void setAcceptanceDate(OffsetDateTime v) { this.acceptanceDate = v; }
    public LocalDate getJoiningDate() { return joiningDate; } public void setJoiningDate(LocalDate v) { this.joiningDate = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
