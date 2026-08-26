package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "alumni_profiles")
public class AlumniProfile {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "user_id", nullable = false, unique = true) private UUID userId;
    @Column(name = "institution_id") private UUID institutionId;
    @Column(name = "graduation_year", nullable = false) private Integer graduationYear;
    @Column(name = "current_company", length = 200) private String currentCompany;
    @Column(name = "current_role", length = 200) private String currentRole;
    @Column(length = 100) private String industry;
    @Column(name = "experience_years") private Integer experienceYears = 0;
    @Column(columnDefinition = "text") private String skills;
    @Column(columnDefinition = "text") private String achievements;
    @Column(columnDefinition = "text") private String bio;
    @Column(name = "is_mentoring", nullable = false) private Boolean isMentoring = false;
    @Column(name = "mentor_availability", length = 30) private String mentorAvailability = "UNAVAILABLE";
    @Column(name = "public_profile", nullable = false) private Boolean publicProfile = true;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public AlumniProfile() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getUserId() { return userId; } public void setUserId(UUID v) { this.userId = v; }
    public UUID getInstitutionId() { return institutionId; } public void setInstitutionId(UUID v) { this.institutionId = v; }
    public Integer getGraduationYear() { return graduationYear; } public void setGraduationYear(Integer v) { this.graduationYear = v; }
    public String getCurrentCompany() { return currentCompany; } public void setCurrentCompany(String v) { this.currentCompany = v; }
    public String getCurrentRole() { return currentRole; } public void setCurrentRole(String v) { this.currentRole = v; }
    public String getIndustry() { return industry; } public void setIndustry(String v) { this.industry = v; }
    public Integer getExperienceYears() { return experienceYears; } public void setExperienceYears(Integer v) { this.experienceYears = v; }
    public String getSkills() { return skills; } public void setSkills(String v) { this.skills = v; }
    public String getAchievements() { return achievements; } public void setAchievements(String v) { this.achievements = v; }
    public String getBio() { return bio; } public void setBio(String v) { this.bio = v; }
    public Boolean getIsMentoring() { return isMentoring; } public void setIsMentoring(Boolean v) { this.isMentoring = v; }
    public String getMentorAvailability() { return mentorAvailability; } public void setMentorAvailability(String v) { this.mentorAvailability = v; }
    public Boolean getPublicProfile() { return publicProfile; } public void setPublicProfile(Boolean v) { this.publicProfile = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
