package com.beyon.profile.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.profile.model.*;
import com.beyon.profile.service.TaxonomyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    @GetMapping("/skills/{slug}/related")
    public ResponseEntity<ApiResponse<List<SkillRelationship>>> getRelatedSkills(@PathVariable String slug) {
        Skill skill = taxonomyService.getSkillBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(taxonomyService.getRelatedSkills(skill.getId())));
    }
}
