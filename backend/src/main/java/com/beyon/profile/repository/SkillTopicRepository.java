package com.beyon.profile.repository;

import com.beyon.profile.model.SkillTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SkillTopicRepository extends JpaRepository<SkillTopic, UUID> {
    List<SkillTopic> findBySkillIdAndActiveTrueOrderByDisplayOrder(UUID skillId);
    Optional<SkillTopic> findBySkillIdAndSlug(UUID skillId, String slug);
    Optional<SkillTopic> findById(UUID id);

    @Query("SELECT t.skillId, COUNT(t) FROM SkillTopic t WHERE t.active = true GROUP BY t.skillId")
    List<Object[]> countTopicsGroupedBySkill();
}

