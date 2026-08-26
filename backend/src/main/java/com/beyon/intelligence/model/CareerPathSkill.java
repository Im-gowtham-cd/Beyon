package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "career_path_skills")
public class CareerPathSkill {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "career_path_id", nullable = false) private UUID careerPathId;
    @Column(name = "skill_id", nullable = false) private UUID skillId;
    @Column(nullable = false) private Boolean required = true;
    @Column(name = "proficiency_level", nullable = false, length = 30) private String proficiencyLevel = "INTERMEDIATE";
    @Column(name = "sort_order", nullable = false) private Integer sortOrder = 0;
    @Column(columnDefinition = "UUID[]") private UUID[] prerequisites;

    public CareerPathSkill() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getCareerPathId() { return careerPathId; } public void setCareerPathId(UUID v) { this.careerPathId = v; }
    public UUID getSkillId() { return skillId; } public void setSkillId(UUID v) { this.skillId = v; }
    public Boolean getRequired() { return required; } public void setRequired(Boolean v) { this.required = v; }
    public String getProficiencyLevel() { return proficiencyLevel; } public void setProficiencyLevel(String v) { this.proficiencyLevel = v; }
    public Integer getSortOrder() { return sortOrder; } public void setSortOrder(Integer v) { this.sortOrder = v; }
    public UUID[] getPrerequisites() { return prerequisites; } public void setPrerequisites(UUID[] v) { this.prerequisites = v; }
}
