package com.beyon.profile.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.profile.model.*;
import com.beyon.profile.service.TaxonomyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/taxonomy")
public class TaxonomyController {

    private final TaxonomyService taxonomyService;

    public TaxonomyController(TaxonomyService taxonomyService) {
        this.taxonomyService = taxonomyService;
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<SkillCategory>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(taxonomyService.getCategories()));
    }

    @GetMapping("/categories/{slug}")
    public ResponseEntity<ApiResponse<SkillCategory>> getCategory(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(taxonomyService.getCategoryBySlug(slug)));
    }

    @GetMapping("/skills")
    public ResponseEntity<ApiResponse<List<Skill>>> getSkills(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "50") int limit) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok(taxonomyService.searchSkills(search, limit)));
        }
        if (categoryId != null) {
            return ResponseEntity.ok(ApiResponse.ok(taxonomyService.getSkillsByCategory(categoryId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(taxonomyService.getSkills()));
    }

    @GetMapping("/skills/{slug}")
    public ResponseEntity<ApiResponse<Skill>> getSkill(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(taxonomyService.getSkillBySlug(slug)));
    }

    @GetMapping("/skills/{slug}/topics")
    public ResponseEntity<ApiResponse<List<SkillTopic>>> getTopics(@PathVariable String slug) {
        Skill skill = taxonomyService.getSkillBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(taxonomyService.getTopicsForSkill(skill.getId())));
    }

    @GetMapping("/skills/{skillSlug}/topics/{topicSlug}")
    public ResponseEntity<ApiResponse<SkillTopic>> getTopic(@PathVariable String skillSlug, @PathVariable String topicSlug) {
        Skill skill = taxonomyService.getSkillBySlug(skillSlug);
        return ResponseEntity.ok(ApiResponse.ok(taxonomyService.getTopicBySlug(skill.getId(), topicSlug)));
    }

    @GetMapping("/skills/{skillSlug}/topics/{topicSlug}/subtopics")
    public ResponseEntity<ApiResponse<List<SkillSubtopic>>> getSubtopics(@PathVariable String skillSlug, @PathVariable String topicSlug) {
        Skill skill = taxonomyService.getSkillBySlug(skillSlug);
        SkillTopic topic = taxonomyService.getTopicBySlug(skill.getId(), topicSlug);
        return ResponseEntity.ok(ApiResponse.ok(taxonomyService.getSubtopicsForTopic(topic.getId())));
    }

    @GetMapping("/relationships")
    public ResponseEntity<ApiResponse<List<SkillRelationship>>> getAllRelationships() {
        return ResponseEntity.ok(ApiResponse.ok(taxonomyService.getAllRelationships()));
    }

    @GetMapping("/skills/{slug}/related")
    public ResponseEntity<ApiResponse<List<SkillRelationship>>> getRelatedSkills(@PathVariable String slug) {
        Skill skill = taxonomyService.getSkillBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(taxonomyService.getRelatedSkills(skill.getId())));
    }

    @PostMapping("/skills")
    public ResponseEntity<ApiResponse<Skill>> createSkill(@RequestBody CreateSkillRequest request) {
        Skill created = taxonomyService.createSkill(request.getName(), request.getSlug(), request.getCategoryId(), request.getDescription(), request.getChapters());
        return ResponseEntity.ok(ApiResponse.ok(created));
    }

    @PutMapping("/skills/{id}")
    public ResponseEntity<ApiResponse<Skill>> updateSkill(
            @PathVariable UUID id,
            @RequestBody CreateSkillRequest request) {
        Skill updated = taxonomyService.updateSkill(id, request.getName(), request.getSlug(), request.getCategoryId(), request.getDescription());
        return ResponseEntity.ok(ApiResponse.ok(updated));
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSkill(@PathVariable UUID id) {
        taxonomyService.deleteSkill(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @GetMapping("/skills/{id}/curriculum")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurriculum(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(taxonomyService.getCurriculum(id)));
    }

    @PostMapping("/skills/{id}/topics")
    public ResponseEntity<ApiResponse<SkillTopic>> createTopic(
            @PathVariable UUID id,
            @RequestBody ChapterRequest request) {
        SkillTopic topic = taxonomyService.createTopic(id, request.getName(), request.getSlug(), request.getDescription(), request.getDisplayOrder());
        return ResponseEntity.ok(ApiResponse.ok(topic));
    }

    @PutMapping("/topics/{topicId}")
    public ResponseEntity<ApiResponse<SkillTopic>> updateTopic(
            @PathVariable UUID topicId,
            @RequestBody ChapterRequest request) {
        SkillTopic topic = taxonomyService.updateTopic(topicId, request.getName(), request.getSlug(), request.getDescription(), request.getDisplayOrder());
        return ResponseEntity.ok(ApiResponse.ok(topic));
    }

    @DeleteMapping("/topics/{topicId}")
    public ResponseEntity<ApiResponse<Void>> deleteTopic(@PathVariable UUID topicId) {
        taxonomyService.deleteTopic(topicId);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/topics/{topicId}/subtopics")
    public ResponseEntity<ApiResponse<SkillSubtopic>> createSubtopic(
            @PathVariable UUID topicId,
            @RequestBody LessonRequest request) {
        SkillSubtopic subtopic = taxonomyService.createSubtopic(topicId, request.getName(), request.getSlug(), request.getDescription(), request.getDisplayOrder());
        return ResponseEntity.ok(ApiResponse.ok(subtopic));
    }

    @PutMapping("/subtopics/{subtopicId}")
    public ResponseEntity<ApiResponse<SkillSubtopic>> updateSubtopic(
            @PathVariable UUID subtopicId,
            @RequestBody LessonRequest request) {
        SkillSubtopic subtopic = taxonomyService.updateSubtopic(subtopicId, request.getName(), request.getSlug(), request.getDescription(), request.getDisplayOrder());
        return ResponseEntity.ok(ApiResponse.ok(subtopic));
    }

    @DeleteMapping("/subtopics/{subtopicId}")
    public ResponseEntity<ApiResponse<Void>> deleteSubtopic(@PathVariable UUID subtopicId) {
        taxonomyService.deleteSubtopic(subtopicId);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    public static class CreateSkillRequest {
        private String name;
        private String slug;
        private UUID categoryId;
        private String description;
        private List<ChapterRequest> chapters;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }
        public UUID getCategoryId() { return categoryId; }
        public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<ChapterRequest> getChapters() { return chapters; }
        public void setChapters(List<ChapterRequest> chapters) { this.chapters = chapters; }
    }

    public static class ChapterRequest {
        private UUID id;
        private String name;
        private String slug;
        private String description;
        private Integer displayOrder;
        private List<LessonRequest> lessons;

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Integer getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
        public List<LessonRequest> getLessons() { return lessons; }
        public void setLessons(List<LessonRequest> lessons) { this.lessons = lessons; }
    }

    public static class LessonRequest {
        private UUID id;
        private String name;
        private String slug;
        private String description;
        private Integer displayOrder;

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Integer getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    }
}

