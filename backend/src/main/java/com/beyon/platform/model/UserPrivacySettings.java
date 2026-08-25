package com.beyon.platform.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_privacy_settings")
public class UserPrivacySettings {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "user_id", nullable = false, unique = true) private UUID userId;
    @Column(name = "profile_visibility", nullable = false, length = 20) private String profileVisibility = "PUBLIC";
    @Column(name = "portfolio_visibility", nullable = false, length = 20) private String portfolioVisibility = "PUBLIC";
    @Column(name = "company_visibility", nullable = false, length = 20) private String companyVisibility = "PUBLIC";
    @Column(name = "institution_visibility", nullable = false, length = 20) private String institutionVisibility = "PUBLIC";
    @Column(name = "assessment_data_sharing", nullable = false) private Boolean assessmentDataSharing = true;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public UserPrivacySettings() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getUserId() { return userId; } public void setUserId(UUID v) { this.userId = v; }
    public String getProfileVisibility() { return profileVisibility; } public void setProfileVisibility(String v) { this.profileVisibility = v; }
    public String getPortfolioVisibility() { return portfolioVisibility; } public void setPortfolioVisibility(String v) { this.portfolioVisibility = v; }
    public String getCompanyVisibility() { return companyVisibility; } public void setCompanyVisibility(String v) { this.companyVisibility = v; }
    public String getInstitutionVisibility() { return institutionVisibility; } public void setInstitutionVisibility(String v) { this.institutionVisibility = v; }
    public Boolean getAssessmentDataSharing() { return assessmentDataSharing; } public void setAssessmentDataSharing(Boolean v) { this.assessmentDataSharing = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
