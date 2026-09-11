package com.beyon.profile.service;

import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.profile.model.*;
import com.beyon.profile.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.beyon.profile.controller.TaxonomyController;
import java.util.*;

@Service
public class TaxonomyService {

    private static final Logger log = LoggerFactory.getLogger(TaxonomyService.class);

    private final SkillCategoryRepository skillCategoryRepository;
    private final SkillRepository skillRepository;
    private final SkillTopicRepository skillTopicRepository;
    private final SkillSubtopicRepository skillSubtopicRepository;
    private final SkillRelationshipRepository skillRelationshipRepository;
    private final JdbcTemplate jdbcTemplate;

    public TaxonomyService(SkillCategoryRepository skillCategoryRepository,
                           SkillRepository skillRepository,
                           SkillTopicRepository skillTopicRepository,
                           SkillSubtopicRepository skillSubtopicRepository,
                           SkillRelationshipRepository skillRelationshipRepository,
                           @org.springframework.beans.factory.annotation.Autowired(required = false)
                           JdbcTemplate jdbcTemplate) {
        this.skillCategoryRepository = skillCategoryRepository;
        this.skillRepository = skillRepository;
        this.skillTopicRepository = skillTopicRepository;
        this.skillSubtopicRepository = skillSubtopicRepository;
        this.skillRelationshipRepository = skillRelationshipRepository;
        this.jdbcTemplate = jdbcTemplate;
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
        List<Skill> skills = skillRepository.searchByName(query.trim(), org.springframework.data.domain.PageRequest.of(0, Math.min(limit, 50)));
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

    public List<SkillRelationship> getAllRelationships() {
        return skillRelationshipRepository.findAll();
    }

    public int getTopicCountForSkill(UUID skillId) {
        return skillTopicRepository.findBySkillIdAndActiveTrueOrderByDisplayOrder(skillId).size();
    }

    @org.springframework.transaction.annotation.Transactional
    public Skill createSkill(String name, String slug, UUID categoryId, String description) {
        return createSkill(name, slug, categoryId, description, null);
    }

    @org.springframework.transaction.annotation.Transactional
    public Skill createSkill(String name, String slug, UUID categoryId, String description, List<TaxonomyController.ChapterRequest> chapters) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Skill name is required");
        }
        if (slug == null || slug.isBlank()) {
            slug = name.toLowerCase().trim().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        }
        SkillCategory cat = categoryId != null ? skillCategoryRepository.findById(categoryId).orElse(null) : null;
        String categoryName = cat != null ? cat.getName() : "General";

        Skill skill = new Skill();
        skill.setName(name.trim());
        skill.setSlug(slug);
        skill.setCategoryId(categoryId);
        skill.setCategory(categoryName);
        skill.setDescription(description != null ? description.trim() : null);
        skill.setActive(true);
        Skill saved = skillRepository.save(skill);

        syncTaxonomyNode(saved.getId(), saved.getCategoryId(), saved.getName(), saved.getSlug(), saved.getDescription());

        int createdTopics = 0;
        if (chapters != null && !chapters.isEmpty()) {
            int chOrder = 1;
            for (TaxonomyController.ChapterRequest ch : chapters) {
                if (ch.getName() == null || ch.getName().isBlank()) continue;
                String chSlug = ch.getSlug();
                if (chSlug == null || chSlug.isBlank()) {
                    chSlug = ch.getName().toLowerCase().trim().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
                }
                SkillTopic topic = new SkillTopic();
                topic.setSkillId(saved.getId());
                topic.setName(ch.getName().trim());
                topic.setSlug(chSlug);
                topic.setDescription(ch.getDescription() != null ? ch.getDescription().trim() : null);
                topic.setDisplayOrder(ch.getDisplayOrder() != null ? ch.getDisplayOrder() : chOrder++);
                topic.setActive(true);
                SkillTopic savedTopic = skillTopicRepository.save(topic);
                createdTopics++;

                if (ch.getLessons() != null && !ch.getLessons().isEmpty()) {
                    int lesOrder = 1;
                    for (TaxonomyController.LessonRequest les : ch.getLessons()) {
                        if (les.getName() == null || les.getName().isBlank()) continue;
                        String lesSlug = les.getSlug();
                        if (lesSlug == null || lesSlug.isBlank()) {
                            lesSlug = les.getName().toLowerCase().trim().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
                        }
                        SkillSubtopic sub = new SkillSubtopic();
                        sub.setTopicId(savedTopic.getId());
                        sub.setName(les.getName().trim());
                        sub.setSlug(lesSlug);
                        sub.setDescription(les.getDescription() != null ? les.getDescription().trim() : null);
                        sub.setDisplayOrder(les.getDisplayOrder() != null ? les.getDisplayOrder() : lesOrder++);
                        sub.setActive(true);
                        skillSubtopicRepository.save(sub);
                    }
                }
            }
        }
        saved.setTopicCount(createdTopics);
        return saved;
    }

    public Map<String, Object> getCurriculum(UUID skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + skillId));

        List<SkillTopic> topics = skillTopicRepository.findBySkillIdAndActiveTrueOrderByDisplayOrder(skillId);
        List<Map<String, Object>> chapterList = new ArrayList<>();
        int totalLessons = 0;

        for (SkillTopic t : topics) {
            List<SkillSubtopic> subtopics = skillSubtopicRepository.findByTopicIdAndActiveTrueOrderByDisplayOrder(t.getId());
            totalLessons += subtopics.size();
            Map<String, Object> chMap = new LinkedHashMap<>();
            chMap.put("id", t.getId());
            chMap.put("skillId", t.getSkillId());
            chMap.put("name", t.getName());
            chMap.put("slug", t.getSlug());
            chMap.put("description", t.getDescription());
            chMap.put("displayOrder", t.getDisplayOrder());
            chMap.put("lessonCount", subtopics.size());
            chMap.put("lessons", subtopics);
            chapterList.add(chMap);
        }

        int enrolledStudents = 0;
        if (jdbcTemplate != null) {
            try {
                Integer count = jdbcTemplate.queryForObject(
                        "SELECT count(DISTINCT user_id) FROM student_learning_skills WHERE skill_id = ?",
                        Integer.class, skillId.toString()
                );
                enrolledStudents = count != null ? count : 0;
            } catch (Exception ignored) {}
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("skill", skill);
        result.put("chapters", chapterList);
        result.put("totalChapters", topics.size());
        result.put("totalLessons", totalLessons);
        result.put("enrolledStudents", enrolledStudents);
        return result;
    }

    @org.springframework.transaction.annotation.Transactional
    public SkillTopic createTopic(UUID skillId, String name, String slug, String description, Integer displayOrder) {
        if (!skillRepository.existsById(skillId)) {
            throw new ResourceNotFoundException("Skill not found: " + skillId);
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Chapter name is required");
        }
        if (slug == null || slug.isBlank()) {
            slug = name.toLowerCase().trim().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        }
        SkillTopic topic = new SkillTopic();
        topic.setSkillId(skillId);
        topic.setName(name.trim());
        topic.setSlug(slug);
        topic.setDescription(description != null ? description.trim() : null);
        topic.setDisplayOrder(displayOrder != null ? displayOrder : getTopicCountForSkill(skillId) + 1);
        topic.setActive(true);
        return skillTopicRepository.save(topic);
    }

    @org.springframework.transaction.annotation.Transactional
    public SkillTopic updateTopic(UUID topicId, String name, String slug, String description, Integer displayOrder) {
        SkillTopic topic = skillTopicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found: " + topicId));
        if (name != null && !name.isBlank()) topic.setName(name.trim());
        if (slug != null && !slug.isBlank()) topic.setSlug(slug.trim().toLowerCase());
        if (description != null) topic.setDescription(description.trim());
        if (displayOrder != null) topic.setDisplayOrder(displayOrder);
        return skillTopicRepository.save(topic);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteTopic(UUID topicId) {
        SkillTopic topic = skillTopicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found: " + topicId));
        List<SkillSubtopic> subtopics = skillSubtopicRepository.findByTopicIdAndActiveTrueOrderByDisplayOrder(topicId);
        skillSubtopicRepository.deleteAll(subtopics);
        skillTopicRepository.delete(topic);
    }

    @org.springframework.transaction.annotation.Transactional
    public SkillSubtopic createSubtopic(UUID topicId, String name, String slug, String description, Integer displayOrder) {
        if (!skillTopicRepository.existsById(topicId)) {
            throw new ResourceNotFoundException("Chapter not found: " + topicId);
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Lesson name is required");
        }
        if (slug == null || slug.isBlank()) {
            slug = name.toLowerCase().trim().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        }
        SkillSubtopic subtopic = new SkillSubtopic();
        subtopic.setTopicId(topicId);
        subtopic.setName(name.trim());
        subtopic.setSlug(slug);
        subtopic.setDescription(description != null ? description.trim() : null);
        int currentCount = skillSubtopicRepository.findByTopicIdAndActiveTrueOrderByDisplayOrder(topicId).size();
        subtopic.setDisplayOrder(displayOrder != null ? displayOrder : currentCount + 1);
        subtopic.setActive(true);
        return skillSubtopicRepository.save(subtopic);
    }

    @org.springframework.transaction.annotation.Transactional
    public SkillSubtopic updateSubtopic(UUID subtopicId, String name, String slug, String description, Integer displayOrder) {
        SkillSubtopic subtopic = skillSubtopicRepository.findById(subtopicId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found: " + subtopicId));
        if (name != null && !name.isBlank()) subtopic.setName(name.trim());
        if (slug != null && !slug.isBlank()) subtopic.setSlug(slug.trim().toLowerCase());
        if (description != null) subtopic.setDescription(description.trim());
        if (displayOrder != null) subtopic.setDisplayOrder(displayOrder);
        return skillSubtopicRepository.save(subtopic);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteSubtopic(UUID subtopicId) {
        SkillSubtopic subtopic = skillSubtopicRepository.findById(subtopicId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found: " + subtopicId));
        skillSubtopicRepository.delete(subtopic);
    }

    @org.springframework.transaction.annotation.Transactional
    public Skill updateSkill(UUID skillId, String name, String slug, UUID categoryId, String description) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + skillId));
        if (name != null && !name.isBlank()) skill.setName(name.trim());
        if (slug != null && !slug.isBlank()) skill.setSlug(slug.trim());
        if (categoryId != null) {
            skill.setCategoryId(categoryId);
            SkillCategory cat = skillCategoryRepository.findById(categoryId).orElse(null);
            if (cat != null) skill.setCategory(cat.getName());
        }
        if (description != null) skill.setDescription(description.trim());
        Skill saved = skillRepository.save(skill);

        syncTaxonomyNode(saved.getId(), saved.getCategoryId(), saved.getName(), saved.getSlug(), saved.getDescription());
        return saved;
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteSkill(UUID skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + skillId));
        // Delete all topics and subtopics for this skill
        List<SkillTopic> topics = skillTopicRepository.findBySkillIdAndActiveTrueOrderByDisplayOrder(skillId);
        for (SkillTopic t : topics) {
            List<SkillSubtopic> subtopics = skillSubtopicRepository.findByTopicIdAndActiveTrueOrderByDisplayOrder(t.getId());
            skillSubtopicRepository.deleteAll(subtopics);
        }
        skillTopicRepository.deleteAll(topics);
        skillRepository.delete(skill);
        deleteTaxonomyNode(skillId);
    }

    private void syncTaxonomyNode(UUID id, UUID parentId, String name, String slug, String description) {
        if (jdbcTemplate == null || id == null) return;
        try {
            String sql = "INSERT INTO skill_taxonomy_nodes (id, parent_id, name, slug, description, level, sort_order, industry_demand, avg_salary_range, growth_outlook, active, created_at, updated_at) " +
                         "VALUES (?, ?, ?, ?, ?, 'SKILL', 0, 'HIGH', '$90,000 - $160,000', '+24% YoY', 1, NOW(), NOW()) " +
                         "ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug), description = VALUES(description), parent_id = VALUES(parent_id), updated_at = NOW()";
            jdbcTemplate.update(sql, id.toString(), parentId != null ? parentId.toString() : null, name, slug, description);
        } catch (Exception e) {
            log.warn("Taxonomy node sync warning: {}", e.getMessage());
        }
    }

    private void deleteTaxonomyNode(UUID id) {
        if (jdbcTemplate == null || id == null) return;
        try {
            jdbcTemplate.update("DELETE FROM skill_taxonomy_nodes WHERE id = ?", id.toString());
        } catch (Exception e) {
            log.warn("Taxonomy node delete warning: {}", e.getMessage());
        }
    }
}

