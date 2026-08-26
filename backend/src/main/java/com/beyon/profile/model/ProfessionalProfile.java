package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "professional_profiles")
public class ProfessionalProfile {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "user_id", nullable = false, unique = true) private UUID userId;
    @Column(length = 300) private String headline;
    @Column(columnDefinition = "text") private String about;
    @Column(length = 200) private String location;
    @Column(name = "website_url", length = 500) private String websiteUrl;
    @Column(name = "github_url", length = 500) private String githubUrl;
    @Column(name = "linkedin_url", length = 500) private String linkedinUrl;
    @Column(name = "portfolio_url", length = 500) private String portfolioUrl;
    @Column(name = "resume_url", length = 500) private String resumeUrl;
    @Column(nullable = false, length = 30) private String visibility = "PUBLIC";
    @Column(name = "profile_views", nullable = false) private Integer profileViews = 0;
    @Column(name = "last_viewed_at") private OffsetDateTime lastViewedAt;
    @Column(columnDefinition = "jsonb") private String metadata = "{}";
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public ProfessionalProfile() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getUserId() { return userId; } public void setUserId(UUID v) { this.userId = v; }
    public String getHeadline() { return headline; } public void setHeadline(String v) { this.headline = v; }
    public String getAbout() { return about; } public void setAbout(String v) { this.about = v; }
    public String getLocation() { return location; } public void setLocation(String v) { this.location = v; }
    public String getWebsiteUrl() { return websiteUrl; } public void setWebsiteUrl(String v) { this.websiteUrl = v; }
    public String getGithubUrl() { return githubUrl; } public void setGithubUrl(String v) { this.githubUrl = v; }
    public String getLinkedinUrl() { return linkedinUrl; } public void setLinkedinUrl(String v) { this.linkedinUrl = v; }
    public String getPortfolioUrl() { return portfolioUrl; } public void setPortfolioUrl(String v) { this.portfolioUrl = v; }
    public String getResumeUrl() { return resumeUrl; } public void setResumeUrl(String v) { this.resumeUrl = v; }
    public String getVisibility() { return visibility; } public void setVisibility(String v) { this.visibility = v; }
    public Integer getProfileViews() { return profileViews; } public void setProfileViews(Integer v) { this.profileViews = v; }
    public OffsetDateTime getLastViewedAt() { return lastViewedAt; } public void setLastViewedAt(OffsetDateTime v) { this.lastViewedAt = v; }
    public String getMetadata() { return metadata; } public void setMetadata(String v) { this.metadata = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
