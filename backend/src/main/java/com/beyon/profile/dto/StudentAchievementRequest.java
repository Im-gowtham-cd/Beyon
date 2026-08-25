package com.beyon.profile.dto;

import java.time.LocalDate;

public class StudentAchievementRequest {
    private String title;
    private String description;
    private String category;
    private String organization;
    private LocalDate achievementDate;
    private String url;
    private String proofUrl;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    public LocalDate getAchievementDate() { return achievementDate; }
    public void setAchievementDate(LocalDate achievementDate) { this.achievementDate = achievementDate; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getProofUrl() { return proofUrl; }
    public void setProofUrl(String proofUrl) { this.proofUrl = proofUrl; }
}
