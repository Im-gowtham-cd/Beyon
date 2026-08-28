package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_learning_skills")
public class StudentLearningSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "varchar(36)")
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(columnDefinition = "varchar(36)")
    private UUID skillId;

    @Column(nullable = false, length = 100)
    private String skillName;

    @Column(nullable = false, length = 20)
    private String status = "LEARNING";

    @Column(nullable = false, updatable = false)
    private Instant startedAt = Instant.now();

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public UUID getSkillId() { return skillId; }
    public void setSkillId(UUID skillId) { this.skillId = skillId; }
    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getCreatedAt() { return createdAt; }
}
