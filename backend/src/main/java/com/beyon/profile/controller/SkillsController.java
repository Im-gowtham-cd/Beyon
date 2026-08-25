package com.beyon.profile.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.profile.model.Skill;
import com.beyon.profile.service.StudentProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/skills")
public class SkillsController {

    private final StudentProfileService studentProfileService;

    public SkillsController(StudentProfileService studentProfileService) {
        this.studentProfileService = studentProfileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Skill>>> searchSkills(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "20") int limit) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok(studentProfileService.searchSkills(search, limit)));
        }
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.getAllActiveSkills()));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<Skill>>> getSkillsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.getSkillsByCategory(category)));
    }

    @GetMapping("/public/{username}")
    public ResponseEntity<ApiResponse<List<Skill>>> getPublicSkills(@PathVariable String username) {
        var profile = studentProfileService.getPublicProfile(username);
        return ResponseEntity.ok(ApiResponse.ok(List.of()));
    }
}
