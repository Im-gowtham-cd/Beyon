package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "skill_relationships", uniqueConstraints = @UniqueConstraint(columnNames = {"source_skill_id", "target_skill_id", "relationship_type"}))
public class SkillRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "varchar(36)")
    private UUID id;

    @Column(nullable = false)
    private UUID sourceSkillId;

    @Column(nullable = false)
    private UUID targetSkillId;

    @Column(nullable = false, length = 20)
    private String relationshipType;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getSourceSkillId() { return sourceSkillId; }
    public void setSourceSkillId(UUID sourceSkillId) { this.sourceSkillId = sourceSkillId; }
    public UUID getTargetSkillId() { return targetSkillId; }
    public void setTargetSkillId(UUID targetSkillId) { this.targetSkillId = targetSkillId; }
    public String getRelationshipType() { return relationshipType; }
    public void setRelationshipType(String relationshipType) { this.relationshipType = relationshipType; }
    public Instant getCreatedAt() { return createdAt; }
}
