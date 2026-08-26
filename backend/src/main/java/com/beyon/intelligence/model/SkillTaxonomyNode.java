package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "skill_taxonomy_nodes")
public class SkillTaxonomyNode {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "parent_id") private UUID parentId;
    @Column(nullable = false, length = 200) private String name;
    @Column(nullable = false, unique = true, length = 200) private String slug;
    @Column(columnDefinition = "text") private String description;
    @Column(nullable = false, length = 20) private String level = "CATEGORY";
    @Column(name = "sort_order", nullable = false) private Integer sortOrder = 0;
    @Column(length = 50) private String icon;
    @Column(name = "industry_demand", length = 20) private String industryDemand = "MEDIUM";
    @Column(name = "avg_salary_range", length = 100) private String avgSalaryRange;
    @Column(name = "growth_outlook", length = 100) private String growthOutlook;
    @Column(nullable = false) private Boolean active = true;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public SkillTaxonomyNode() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getParentId() { return parentId; } public void setParentId(UUID v) { this.parentId = v; }
    public String getName() { return name; } public void setName(String v) { this.name = v; }
    public String getSlug() { return slug; } public void setSlug(String v) { this.slug = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public String getLevel() { return level; } public void setLevel(String v) { this.level = v; }
    public Integer getSortOrder() { return sortOrder; } public void setSortOrder(Integer v) { this.sortOrder = v; }
    public String getIcon() { return icon; } public void setIcon(String v) { this.icon = v; }
    public String getIndustryDemand() { return industryDemand; } public void setIndustryDemand(String v) { this.industryDemand = v; }
    public String getAvgSalaryRange() { return avgSalaryRange; } public void setAvgSalaryRange(String v) { this.avgSalaryRange = v; }
    public String getGrowthOutlook() { return growthOutlook; } public void setGrowthOutlook(String v) { this.growthOutlook = v; }
    public Boolean getActive() { return active; } public void setActive(Boolean v) { this.active = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
