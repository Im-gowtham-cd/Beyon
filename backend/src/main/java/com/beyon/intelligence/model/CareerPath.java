package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "career_paths")
public class CareerPath {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false, length = 200) private String name;
    @Column(nullable = false, unique = true, length = 200) private String slug;
    @Column(columnDefinition = "text") private String description;
    @Column(length = 100) private String category;
    @Column(name = "required_skills", columnDefinition = "jsonb", nullable = false) private String requiredSkills = "[]";
    @Column(name = "optional_skills", columnDefinition = "jsonb") private String optionalSkills = "[]";
    @Column(name = "typical_education", length = 200) private String typicalEducation;
    @Column(name = "salary_range", length = 100) private String salaryRange;
    @Column(name = "growth_outlook", length = 100) private String growthOutlook;
    @Column(nullable = false) private Boolean active = true;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public CareerPath() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public String getName() { return name; } public void setName(String v) { this.name = v; }
    public String getSlug() { return slug; } public void setSlug(String v) { this.slug = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public String getCategory() { return category; } public void setCategory(String v) { this.category = v; }
    public String getRequiredSkills() { return requiredSkills; } public void setRequiredSkills(String v) { this.requiredSkills = v; }
    public String getOptionalSkills() { return optionalSkills; } public void setOptionalSkills(String v) { this.optionalSkills = v; }
    public String getTypicalEducation() { return typicalEducation; } public void setTypicalEducation(String v) { this.typicalEducation = v; }
    public String getSalaryRange() { return salaryRange; } public void setSalaryRange(String v) { this.salaryRange = v; }
    public String getGrowthOutlook() { return growthOutlook; } public void setGrowthOutlook(String v) { this.growthOutlook = v; }
    public Boolean getActive() { return active; } public void setActive(Boolean v) { this.active = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
