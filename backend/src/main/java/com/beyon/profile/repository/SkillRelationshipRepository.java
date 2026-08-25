package com.beyon.profile.repository;

import com.beyon.profile.model.SkillRelationship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SkillRelationshipRepository extends JpaRepository<SkillRelationship, UUID> {
    List<SkillRelationship> findBySourceSkillId(UUID sourceSkillId);
    List<SkillRelationship> findByTargetSkillId(UUID targetSkillId);
}
