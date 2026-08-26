package com.beyon.platform.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "platform_daily_stats")
public class PlatformDailyStats {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "stat_date", nullable = false, unique = true) private LocalDate statDate;
    @Column(name = "total_users", nullable = false) private Integer totalUsers = 0;
    @Column(name = "new_registrations", nullable = false) private Integer newRegistrations = 0;
    @Column(name = "active_users", nullable = false) private Integer activeUsers = 0;
    @Column(name = "total_assessments", nullable = false) private Integer totalAssessments = 0;
    @Column(name = "total_applications", nullable = false) private Integer totalApplications = 0;
    @Column(name = "total_placements", nullable = false) private Integer totalPlacements = 0;
    @Column(name = "total_coins_earned", precision = 15, scale = 2) private BigDecimal totalCoinsEarned = BigDecimal.ZERO;
    @Column(name = "total_coins_spent", precision = 15, scale = 2) private BigDecimal totalCoinsSpent = BigDecimal.ZERO;
    @Column(name = "active_companies", nullable = false) private Integer activeCompanies = 0;
    @Column(name = "active_institutions", nullable = false) private Integer activeInstitutions = 0;
    @Column(name = "new_posts", nullable = false) private Integer newPosts = 0;
    @Column(name = "new_feedback_reports", nullable = false) private Integer newFeedbackReports = 0;
    @Column(name = "resolved_feedback_reports", nullable = false) private Integer resolvedFeedbackReports = 0;
    @Column(columnDefinition = "jsonb") private String metadata = "{}";
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public PlatformDailyStats() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public LocalDate getStatDate() { return statDate; } public void setStatDate(LocalDate v) { this.statDate = v; }
    public Integer getTotalUsers() { return totalUsers; } public void setTotalUsers(Integer v) { this.totalUsers = v; }
    public Integer getNewRegistrations() { return newRegistrations; } public void setNewRegistrations(Integer v) { this.newRegistrations = v; }
    public Integer getActiveUsers() { return activeUsers; } public void setActiveUsers(Integer v) { this.activeUsers = v; }
    public Integer getTotalAssessments() { return totalAssessments; } public void setTotalAssessments(Integer v) { this.totalAssessments = v; }
    public Integer getTotalApplications() { return totalApplications; } public void setTotalApplications(Integer v) { this.totalApplications = v; }
    public Integer getTotalPlacements() { return totalPlacements; } public void setTotalPlacements(Integer v) { this.totalPlacements = v; }
    public BigDecimal getTotalCoinsEarned() { return totalCoinsEarned; } public void setTotalCoinsEarned(BigDecimal v) { this.totalCoinsEarned = v; }
    public BigDecimal getTotalCoinsSpent() { return totalCoinsSpent; } public void setTotalCoinsSpent(BigDecimal v) { this.totalCoinsSpent = v; }
    public Integer getActiveCompanies() { return activeCompanies; } public void setActiveCompanies(Integer v) { this.activeCompanies = v; }
    public Integer getActiveInstitutions() { return activeInstitutions; } public void setActiveInstitutions(Integer v) { this.activeInstitutions = v; }
    public Integer getNewPosts() { return newPosts; } public void setNewPosts(Integer v) { this.newPosts = v; }
    public Integer getNewFeedbackReports() { return newFeedbackReports; } public void setNewFeedbackReports(Integer v) { this.newFeedbackReports = v; }
    public Integer getResolvedFeedbackReports() { return resolvedFeedbackReports; } public void setResolvedFeedbackReports(Integer v) { this.resolvedFeedbackReports = v; }
    public String getMetadata() { return metadata; } public void setMetadata(String v) { this.metadata = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
