package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "portfolio_projects")
public class PortfolioProject {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(nullable = false, length = 300) private String title;
    @Column(columnDefinition = "text") private String description;
    @Column(length = 200) private String role;
    @Column(name = "skills_used") private String skillsUsed;
    @Column(name = "github_url", length = 500) private String githubUrl;
    @Column(name = "live_demo_url", length = 500) private String liveDemoUrl;
    @Column(name = "image_url", length = 500) private String imageUrl;
    @Column(name = "verification_status", nullable = false, length = 30) private String verificationStatus = "UNVERIFIED";
    @Column(name = "verified_by") private UUID verifiedBy;
    @Column(name = "verified_at") private OffsetDateTime verifiedAt;
    @Column(name = "verification_source", length = 50) private String verificationSource;
    @Column(name = "sort_order", nullable = false) private Integer sortOrder = 0;
    @Column(name = "is_featured", nullable = false) private Boolean isFeatured = false;
    @Column(columnDefinition = "jsonb") private String metadata = "{}";
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public PortfolioProject() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public String getRole() { return role; } public void setRole(String v) { this.role = v; }
    public String getSkillsUsed() { return skillsUsed; } public void setSkillsUsed(String v) { this.skillsUsed = v; }
    public String getGithubUrl() { return githubUrl; } public void setGithubUrl(String v) { this.githubUrl = v; }
    public String getLiveDemoUrl() { return liveDemoUrl; } public void setLiveDemoUrl(String v) { this.liveDemoUrl = v; }
    public String getImageUrl() { return imageUrl; } public void setImageUrl(String v) { this.imageUrl = v; }
    public String getVerificationStatus() { return verificationStatus; } public void setVerificationStatus(String v) { this.verificationStatus = v; }
    public UUID getVerifiedBy() { return verifiedBy; } public void setVerifiedBy(UUID v) { this.verifiedBy = v; }
    public OffsetDateTime getVerifiedAt() { return verifiedAt; } public void setVerifiedAt(OffsetDateTime v) { this.verifiedAt = v; }
    public String getVerificationSource() { return verificationSource; } public void setVerificationSource(String v) { this.verificationSource = v; }
    public Integer getSortOrder() { return sortOrder; } public void setSortOrder(Integer v) { this.sortOrder = v; }
    public Boolean getIsFeatured() { return isFeatured; } public void setIsFeatured(Boolean v) { this.isFeatured = v; }
    public String getMetadata() { return metadata; } public void setMetadata(String v) { this.metadata = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
