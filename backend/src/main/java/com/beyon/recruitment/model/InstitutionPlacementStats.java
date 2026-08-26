package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "institution_placement_stats")
public class InstitutionPlacementStats {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "institution_id", nullable = false) private UUID institutionId;
    @Column(name = "academic_year", nullable = false) private Integer academicYear;
    @Column(name = "total_students", nullable = false) private Integer totalStudents = 0;
    @Column(name = "placement_willing", nullable = false) private Integer placementWilling = 0;
    @Column(nullable = false) private Integer eligible = 0;
    @Column(nullable = false) private Integer applied = 0;
    @Column(nullable = false) private Integer assessed = 0;
    @Column(nullable = false) private Integer shortlisted = 0;
    @Column(nullable = false) private Integer interviewed = 0;
    @Column(nullable = false) private Integer placed = 0;
    @Column(name = "placement_rate", precision = 5, scale = 2) private BigDecimal placementRate = BigDecimal.ZERO;
    @Column(name = "average_package", precision = 12, scale = 2) private BigDecimal averagePackage = BigDecimal.ZERO;
    @Column(name = "highest_package", precision = 12, scale = 2) private BigDecimal highestPackage = BigDecimal.ZERO;
    @Column(name = "companies_visited") private Integer companiesVisited = 0;
    @Column(name = "department_stats", columnDefinition = "jsonb") private String departmentStats = "{}";
    @Column(name = "skill_demand", columnDefinition = "jsonb") private String skillDemand = "{}";
    @Column(name = "company_tier_distribution", columnDefinition = "jsonb") private String companyTierDistribution = "{}";
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public InstitutionPlacementStats() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getInstitutionId() { return institutionId; } public void setInstitutionId(UUID v) { this.institutionId = v; }
    public Integer getAcademicYear() { return academicYear; } public void setAcademicYear(Integer v) { this.academicYear = v; }
    public Integer getTotalStudents() { return totalStudents; } public void setTotalStudents(Integer v) { this.totalStudents = v; }
    public Integer getPlacementWilling() { return placementWilling; } public void setPlacementWilling(Integer v) { this.placementWilling = v; }
    public Integer getEligible() { return eligible; } public void setEligible(Integer v) { this.eligible = v; }
    public Integer getApplied() { return applied; } public void setApplied(Integer v) { this.applied = v; }
    public Integer getAssessed() { return assessed; } public void setAssessed(Integer v) { this.assessed = v; }
    public Integer getShortlisted() { return shortlisted; } public void setShortlisted(Integer v) { this.shortlisted = v; }
    public Integer getInterviewed() { return interviewed; } public void setInterviewed(Integer v) { this.interviewed = v; }
    public Integer getPlaced() { return placed; } public void setPlaced(Integer v) { this.placed = v; }
    public BigDecimal getPlacementRate() { return placementRate; } public void setPlacementRate(BigDecimal v) { this.placementRate = v; }
    public BigDecimal getAveragePackage() { return averagePackage; } public void setAveragePackage(BigDecimal v) { this.averagePackage = v; }
    public BigDecimal getHighestPackage() { return highestPackage; } public void setHighestPackage(BigDecimal v) { this.highestPackage = v; }
    public Integer getCompaniesVisited() { return companiesVisited; } public void setCompaniesVisited(Integer v) { this.companiesVisited = v; }
    public String getDepartmentStats() { return departmentStats; } public void setDepartmentStats(String v) { this.departmentStats = v; }
    public String getSkillDemand() { return skillDemand; } public void setSkillDemand(String v) { this.skillDemand = v; }
    public String getCompanyTierDistribution() { return companyTierDistribution; } public void setCompanyTierDistribution(String v) { this.companyTierDistribution = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
