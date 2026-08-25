package com.beyon.institution.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "placement_records")
public class PlacementRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private UUID studentId;

    @Column(columnDefinition = "uuid")
    private UUID institutionId;

    @Column(nullable = false, length = 200)
    private String companyName;

    @Column(length = 20)
    private String companyTier;

    @Column(length = 200)
    private String roleTitle;

    @Column(precision = 8, scale = 2)
    private BigDecimal packageLpa;

    private LocalDate placementDate;

    @Column(length = 30)
    private String placementType;

    @Column(nullable = false, length = 30)
    private String status = "OFFERED";

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public UUID getInstitutionId() { return institutionId; }
    public void setInstitutionId(UUID institutionId) { this.institutionId = institutionId; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getCompanyTier() { return companyTier; }
    public void setCompanyTier(String companyTier) { this.companyTier = companyTier; }
    public String getRoleTitle() { return roleTitle; }
    public void setRoleTitle(String roleTitle) { this.roleTitle = roleTitle; }
    public BigDecimal getPackageLpa() { return packageLpa; }
    public void setPackageLpa(BigDecimal packageLpa) { this.packageLpa = packageLpa; }
    public LocalDate getPlacementDate() { return placementDate; }
    public void setPlacementDate(LocalDate placementDate) { this.placementDate = placementDate; }
    public String getPlacementType() { return placementType; }
    public void setPlacementType(String placementType) { this.placementType = placementType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
