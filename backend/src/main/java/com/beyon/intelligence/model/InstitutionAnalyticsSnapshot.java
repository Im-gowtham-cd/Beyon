package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "institution_analytics_snapshots")
public class InstitutionAnalyticsSnapshot {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "institution_id", nullable = false) private UUID institutionId;
    @Column(name = "snapshot_date", nullable = false) private LocalDate snapshotDate = LocalDate.now();
    @Column(name = "total_students") private Integer totalStudents = 0;
    @Column(name = "placement_seeking") private Integer placementSeeking = 0;
    @Column(name = "placed") private Integer placed = 0;
    @Column(name = "placement_rate", precision = 5, scale = 2) private BigDecimal placementRate = BigDecimal.ZERO;
    @Column(name = "average_package", precision = 8, scale = 2) private BigDecimal averagePackage = BigDecimal.ZERO;
    @Column(name = "highest_package", precision = 8, scale = 2) private BigDecimal highestPackage = BigDecimal.ZERO;
    @Column(name = "tier1_count") private Integer tier1Count = 0;
    @Column(name = "tier2_count") private Integer tier2Count = 0;
    @Column(name = "companies_visited") private Integer companiesVisited = 0;
    @Column(name = "department_stats", columnDefinition = "text") private String departmentStats;
    @Column(name = "skill_demand", columnDefinition = "text") private String skillDemand;
    @Column(name = "assessment_performance", columnDefinition = "text") private String assessmentPerformance;
    @Column(name = "salary_distribution", columnDefinition = "text") private String salaryDistribution;
    @Column(name = "placement_trend", columnDefinition = "text") private String placementTrend;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public InstitutionAnalyticsSnapshot() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getInstitutionId() { return institutionId; } public void setInstitutionId(UUID v) { this.institutionId = v; }
    public LocalDate getSnapshotDate() { return snapshotDate; } public void setSnapshotDate(LocalDate v) { this.snapshotDate = v; }
    public Integer getTotalStudents() { return totalStudents; } public void setTotalStudents(Integer v) { this.totalStudents = v; }
    public Integer getPlacementSeeking() { return placementSeeking; } public void setPlacementSeeking(Integer v) { this.placementSeeking = v; }
    public Integer getPlaced() { return placed; } public void setPlaced(Integer v) { this.placed = v; }
    public BigDecimal getPlacementRate() { return placementRate; } public void setPlacementRate(BigDecimal v) { this.placementRate = v; }
    public BigDecimal getAveragePackage() { return averagePackage; } public void setAveragePackage(BigDecimal v) { this.averagePackage = v; }
    public BigDecimal getHighestPackage() { return highestPackage; } public void setHighestPackage(BigDecimal v) { this.highestPackage = v; }
    public Integer getTier1Count() { return tier1Count; } public void setTier1Count(Integer v) { this.tier1Count = v; }
    public Integer getTier2Count() { return tier2Count; } public void setTier2Count(Integer v) { this.tier2Count = v; }
    public Integer getCompaniesVisited() { return companiesVisited; } public void setCompaniesVisited(Integer v) { this.companiesVisited = v; }
    public String getDepartmentStats() { return departmentStats; } public void setDepartmentStats(String v) { this.departmentStats = v; }
    public String getSkillDemand() { return skillDemand; } public void setSkillDemand(String v) { this.skillDemand = v; }
    public String getAssessmentPerformance() { return assessmentPerformance; } public void setAssessmentPerformance(String v) { this.assessmentPerformance = v; }
    public String getSalaryDistribution() { return salaryDistribution; } public void setSalaryDistribution(String v) { this.salaryDistribution = v; }
    public String getPlacementTrend() { return placementTrend; } public void setPlacementTrend(String v) { this.placementTrend = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
