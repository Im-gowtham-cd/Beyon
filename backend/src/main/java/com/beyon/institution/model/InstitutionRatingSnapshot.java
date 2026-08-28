package com.beyon.institution.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "institution_rating_snapshots")
public class InstitutionRatingSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "varchar(36)")
    private UUID id;

    @Column(nullable = false)
    private UUID institutionId;

    @Column(precision = 3, scale = 2)
    private BigDecimal overallRating;

    @Column(precision = 3, scale = 2)
    private BigDecimal academicScore;

    @Column(precision = 3, scale = 2)
    private BigDecimal placementScore;

    @Column(precision = 3, scale = 2)
    private BigDecimal salaryScore;

    @Column(precision = 3, scale = 2)
    private BigDecimal industryScore;

    @Column(precision = 3, scale = 2)
    private BigDecimal skillScore;

    private Integer totalStudents;

    private Integer studentsPlaced;

    @Column(precision = 5, scale = 2)
    private BigDecimal placementPercentage;

    @Column(precision = 8, scale = 2)
    private BigDecimal averagePackage;

    @Column(precision = 8, scale = 2)
    private BigDecimal highestPackage;

    private Integer tier1Count = 0;

    private Integer tier2Count = 0;

    private Integer companiesVisited = 0;

    @Column(nullable = false)
    private LocalDate snapshotDate = LocalDate.now();

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getInstitutionId() { return institutionId; }
    public void setInstitutionId(UUID institutionId) { this.institutionId = institutionId; }
    public BigDecimal getOverallRating() { return overallRating; }
    public void setOverallRating(BigDecimal overallRating) { this.overallRating = overallRating; }
    public BigDecimal getAcademicScore() { return academicScore; }
    public void setAcademicScore(BigDecimal academicScore) { this.academicScore = academicScore; }
    public BigDecimal getPlacementScore() { return placementScore; }
    public void setPlacementScore(BigDecimal placementScore) { this.placementScore = placementScore; }
    public BigDecimal getSalaryScore() { return salaryScore; }
    public void setSalaryScore(BigDecimal salaryScore) { this.salaryScore = salaryScore; }
    public BigDecimal getIndustryScore() { return industryScore; }
    public void setIndustryScore(BigDecimal industryScore) { this.industryScore = industryScore; }
    public BigDecimal getSkillScore() { return skillScore; }
    public void setSkillScore(BigDecimal skillScore) { this.skillScore = skillScore; }
    public Integer getTotalStudents() { return totalStudents; }
    public void setTotalStudents(Integer totalStudents) { this.totalStudents = totalStudents; }
    public Integer getStudentsPlaced() { return studentsPlaced; }
    public void setStudentsPlaced(Integer studentsPlaced) { this.studentsPlaced = studentsPlaced; }
    public BigDecimal getPlacementPercentage() { return placementPercentage; }
    public void setPlacementPercentage(BigDecimal placementPercentage) { this.placementPercentage = placementPercentage; }
    public BigDecimal getAveragePackage() { return averagePackage; }
    public void setAveragePackage(BigDecimal averagePackage) { this.averagePackage = averagePackage; }
    public BigDecimal getHighestPackage() { return highestPackage; }
    public void setHighestPackage(BigDecimal highestPackage) { this.highestPackage = highestPackage; }
    public Integer getTier1Count() { return tier1Count; }
    public void setTier1Count(Integer tier1Count) { this.tier1Count = tier1Count; }
    public Integer getTier2Count() { return tier2Count; }
    public void setTier2Count(Integer tier2Count) { this.tier2Count = tier2Count; }
    public Integer getCompaniesVisited() { return companiesVisited; }
    public void setCompaniesVisited(Integer companiesVisited) { this.companiesVisited = companiesVisited; }
    public LocalDate getSnapshotDate() { return snapshotDate; }
    public void setSnapshotDate(LocalDate snapshotDate) { this.snapshotDate = snapshotDate; }
    public Instant getCreatedAt() { return createdAt; }
}
