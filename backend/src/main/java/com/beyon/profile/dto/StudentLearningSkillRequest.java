package com.beyon.profile.dto;

import java.util.UUID;

public class StudentLearningSkillRequest {
    private UUID skillId;
    private String skillName;

    public UUID getSkillId() { return skillId; }
    public void setSkillId(UUID skillId) { this.skillId = skillId; }
    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }
}
