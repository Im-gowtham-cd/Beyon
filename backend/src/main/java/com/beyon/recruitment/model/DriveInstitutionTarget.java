package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "drive_institution_targets")
public class DriveInstitutionTarget {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "drive_id", nullable = false) private UUID driveId;
    @Column(name = "institution_id", nullable = false) private UUID institutionId;
    @Column(columnDefinition = "text") private String departments;
    @Column(name = "min_graduation_year") private Integer minGraduationYear;
    @Column(name = "max_graduation_year") private Integer maxGraduationYear;
    @Column(name = "min_cgpa", precision = 4, scale = 2) private BigDecimal minCgpa;
    @Column(name = "placement_willing_only", nullable = false) private Boolean placementWillingOnly = true;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public DriveInstitutionTarget() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getDriveId() { return driveId; } public void setDriveId(UUID v) { this.driveId = v; }
    public UUID getInstitutionId() { return institutionId; } public void setInstitutionId(UUID v) { this.institutionId = v; }
    public String getDepartments() { return departments; } public void setDepartments(String v) { this.departments = v; }
    public Integer getMinGraduationYear() { return minGraduationYear; } public void setMinGraduationYear(Integer v) { this.minGraduationYear = v; }
    public Integer getMaxGraduationYear() { return maxGraduationYear; } public void setMaxGraduationYear(Integer v) { this.maxGraduationYear = v; }
    public BigDecimal getMinCgpa() { return minCgpa; } public void setMinCgpa(BigDecimal v) { this.minCgpa = v; }
    public Boolean getPlacementWillingOnly() { return placementWillingOnly; } public void setPlacementWillingOnly(Boolean v) { this.placementWillingOnly = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
