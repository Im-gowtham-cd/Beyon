package com.beyon.profile.repository;

import com.beyon.profile.model.SkillSubtopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SkillSubtopicRepository extends JpaRepository<SkillSubtopic, UUID> {
    List<SkillSubtopic> findByTopicIdAndActiveTrueOrderByDisplayOrder(UUID topicId);
    Optional<SkillSubtopic> findByTopicIdAndSlug(UUID topicId, String slug);
}
