package com.beyon.profile.service;

import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.profile.model.*;
import com.beyon.profile.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class TaxonomyService {

    private final SkillCategoryRepository skillCategoryRepository;
    private final SkillRepository skillRepository;
    private final SkillTopicRepository skillTopicRepository;
    private final SkillSubtopicRepository skillSubtopicRepository;
    private final SkillRelationshipRepository skillRelationshipRepository;

    public TaxonomyService(SkillCategoryRepository skillCategoryRepository,
                           SkillRepository skillRepository,
                           SkillTopicRepository skillTopicRepository,
                           SkillSubtopicRepository skillSubtopicRepository,
                           SkillRelationshipRepository skillRelationshipRepository) {
        this.skillCategoryRepository = skillCategoryRepository;
        this.skillRepository = skillRepository;
        this.skillTopicRepository = skillTopicRepository;
        this.skillSubtopicRepository = skillSubtopicRepository;
        this.skillRelationshipRepository = skillRelationshipRepository;
    }

    public List<SkillCategory> getCategories() {
        return skillCategoryRepository.findAllActive();
    }

    public SkillCategory getCategoryBySlug(String slug) {
        return skillCategoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + slug));
    }

    public List<Skill> getSkills() {
        List<Skill> skills = skillRepository.findAllActive();
        populateTopicCounts(skills);
        return skills;
    }

    public List<Skill> getSkillsByCategory(UUID categoryId) {
        List<Skill> skills = skillRepository.findByCategoryIdAndActiveTrue(categoryId);
        populateTopicCounts(skills);
        return skills;
    }

    public Skill getSkillBySlug(String slug) {
        Skill skill = skillRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + slug));
        skill.setTopicCount(getTopicCountForSkill(skill.getId()));
        return skill;
    }

    public List<Skill> searchSkills(String query, int limit) {
        List<Skill> skills = skillRepository.searchByName(query.trim(), Math.min(limit, 50));
        populateTopicCounts(skills);
        return skills;
    }

    private void populateTopicCounts(List<Skill> skills) {
        if (skills.isEmpty()) return;
        try {
            List<Object[]> counts = skillTopicRepository.countTopicsGroupedBySkill();
            java.util.Map<UUID, Long> countMap = new java.util.HashMap<>();
            for (Object[] row : counts) {
                if (row[0] != null && row[1] != null) {
                    countMap.put((UUID) row[0], ((Number) row[1]).longValue());
                }
            }
            for (Skill s : skills) {
                s.setTopicCount(countMap.getOrDefault(s.getId(), 0L).intValue());
            }
        } catch (Exception ignored) {
            // fallback
            for (Skill s : skills) {
                s.setTopicCount(getTopicCountForSkill(s.getId()));
            }
        }
    }

    public List<SkillTopic> getTopicsForSkill(UUID skillId) {
        return skillTopicRepository.findBySkillIdAndActiveTrueOrderByDisplayOrder(skillId);
    }

    public SkillTopic getTopicBySlug(UUID skillId, String topicSlug) {
        return skillTopicRepository.findBySkillIdAndSlug(skillId, topicSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
    }

    public List<SkillSubtopic> getSubtopicsForTopic(UUID topicId) {
        return skillSubtopicRepository.findByTopicIdAndActiveTrueOrderByDisplayOrder(topicId);
    }

    public SkillSubtopic getSubtopicBySlug(UUID topicId, String subtopicSlug) {
        return skillSubtopicRepository.findByTopicIdAndSlug(topicId, subtopicSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Subtopic not found"));
    }

    public List<SkillRelationship> getRelatedSkills(UUID skillId) {
        return skillRelationshipRepository.findBySourceSkillId(skillId);
    }

    public int getTopicCountForSkill(UUID skillId) {
        return skillTopicRepository.findBySkillIdAndActiveTrueOrderByDisplayOrder(skillId).size();
    }
}
