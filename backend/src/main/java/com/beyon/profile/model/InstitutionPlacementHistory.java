package com.beyon.profile.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "institution_placement_history")
public class InstitutionPlacementHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 20)
    private String academicYear;

    private Integer studentsPlaced;

    @Column(precision = 5, scale = 2)
    private BigDecimal placementPercentage;

    @Column(precision = 12, scale = 2)
    private BigDecimal averagePackage;

    @Column(precision = 12, scale = 2)
    private BigDecimal highestPackage;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public Integer getStudentsPlaced() { return studentsPlaced; }
    public void setStudentsPlaced(Integer studentsPlaced) { this.studentsPlaced = studentsPlaced; }
    public BigDecimal getPlacementPercentage() { return placementPercentage; }
    public void setPlacementPercentage(BigDecimal placementPercentage) { this.placementPercentage = placementPercentage; }
    public BigDecimal getAveragePackage() { return averagePackage; }
    public void setAveragePackage(BigDecimal averagePackage) { this.averagePackage = averagePackage; }
    public BigDecimal getHighestPackage() { return highestPackage; }
    public void setHighestPackage(BigDecimal highestPackage) { this.highestPackage = highestPackage; }
    public Instant getCreatedAt() { return createdAt; }
}
