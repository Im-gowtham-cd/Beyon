package com.beyon.profile.model;

import com.beyon.profile.enums.WorkType;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_career_preferences")
public class StudentCareerPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID userId;

    @Column(columnDefinition = "TEXT")
    private String preferredRoles;

    @Column(columnDefinition = "TEXT")
    private String preferredIndustries;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private WorkType preferredWorkType;

    @Column(columnDefinition = "TEXT")
    private String preferredLocations;

    @Column(columnDefinition = "TEXT")
    private String careerGoal;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getPreferredRoles() { return preferredRoles; }
    public void setPreferredRoles(String preferredRoles) { this.preferredRoles = preferredRoles; }
    public String getPreferredIndustries() { return preferredIndustries; }
    public void setPreferredIndustries(String preferredIndustries) { this.preferredIndustries = preferredIndustries; }
    public WorkType getPreferredWorkType() { return preferredWorkType; }
    public void setPreferredWorkType(WorkType preferredWorkType) { this.preferredWorkType = preferredWorkType; }
    public String getPreferredLocations() { return preferredLocations; }
    public void setPreferredLocations(String preferredLocations) { this.preferredLocations = preferredLocations; }
    public String getCareerGoal() { return careerGoal; }
    public void setCareerGoal(String careerGoal) { this.careerGoal = careerGoal; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
