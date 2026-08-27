package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "company_analytics_snapshots")
public class CompanyAnalyticsSnapshot {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "company_user_id", nullable = false) private UUID companyUserId;
    @Column(name = "snapshot_date", nullable = false) private LocalDate snapshotDate = LocalDate.now();
    @Column(name = "total_applications") private Integer totalApplications = 0;
    @Column(name = "total_assessments") private Integer totalAssessments = 0;
    @Column(name = "total_shortlisted") private Integer totalShortlisted = 0;
    @Column(name = "total_interviews") private Integer totalInterviews = 0;
    @Column(name = "total_selected") private Integer totalSelected = 0;
    @Column(name = "conversion_rate", precision = 5, scale = 2) private BigDecimal conversionRate = BigDecimal.ZERO;
    @Column(name = "avg_assessment_score", precision = 5, scale = 2) private BigDecimal avgAssessmentScore = BigDecimal.ZERO;
    @Column(name = "avg_time_to_hire_days") private Integer avgTimeToHireDays = 0;
    @Column(name = "institution_performance", columnDefinition = "text") private String institutionPerformance;
    @Column(name = "skill_distribution", columnDefinition = "text") private String skillDistribution;
    @Column(name = "funnel_data", columnDefinition = "text") private String funnelData;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public CompanyAnalyticsSnapshot() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getCompanyUserId() { return companyUserId; } public void setCompanyUserId(UUID v) { this.companyUserId = v; }
    public LocalDate getSnapshotDate() { return snapshotDate; } public void setSnapshotDate(LocalDate v) { this.snapshotDate = v; }
    public Integer getTotalApplications() { return totalApplications; } public void setTotalApplications(Integer v) { this.totalApplications = v; }
    public Integer getTotalAssessments() { return totalAssessments; } public void setTotalAssessments(Integer v) { this.totalAssessments = v; }
    public Integer getTotalShortlisted() { return totalShortlisted; } public void setTotalShortlisted(Integer v) { this.totalShortlisted = v; }
    public Integer getTotalInterviews() { return totalInterviews; } public void setTotalInterviews(Integer v) { this.totalInterviews = v; }
    public Integer getTotalSelected() { return totalSelected; } public void setTotalSelected(Integer v) { this.totalSelected = v; }
    public BigDecimal getConversionRate() { return conversionRate; } public void setConversionRate(BigDecimal v) { this.conversionRate = v; }
    public BigDecimal getAvgAssessmentScore() { return avgAssessmentScore; } public void setAvgAssessmentScore(BigDecimal v) { this.avgAssessmentScore = v; }
    public Integer getAvgTimeToHireDays() { return avgTimeToHireDays; } public void setAvgTimeToHireDays(Integer v) { this.avgTimeToHireDays = v; }
    public String getInstitutionPerformance() { return institutionPerformance; } public void setInstitutionPerformance(String v) { this.institutionPerformance = v; }
    public String getSkillDistribution() { return skillDistribution; } public void setSkillDistribution(String v) { this.skillDistribution = v; }
    public String getFunnelData() { return funnelData; } public void setFunnelData(String v) { this.funnelData = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
