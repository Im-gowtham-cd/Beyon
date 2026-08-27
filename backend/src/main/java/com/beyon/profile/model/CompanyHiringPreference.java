package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "company_hiring_preferences")
public class CompanyHiringPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "varchar(36)")
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(columnDefinition = "TEXT")
    private String hiringTypes;

    @Column(columnDefinition = "TEXT")
    private String preferredLevels;

    @Column(columnDefinition = "TEXT")
    private String recruitmentRegions;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getHiringTypes() { return hiringTypes; }
    public void setHiringTypes(String hiringTypes) { this.hiringTypes = hiringTypes; }
    public String getPreferredLevels() { return preferredLevels; }
    public void setPreferredLevels(String preferredLevels) { this.preferredLevels = preferredLevels; }
    public String getRecruitmentRegions() { return recruitmentRegions; }
    public void setRecruitmentRegions(String recruitmentRegions) { this.recruitmentRegions = recruitmentRegions; }
    public Instant getCreatedAt() { return createdAt; }
}
