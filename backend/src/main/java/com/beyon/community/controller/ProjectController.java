package com.beyon.community.controller;

import com.beyon.community.model.*;
import com.beyon.community.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    private UUID extractUserId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    @PostMapping
    public ResponseEntity<IndustryProject> createProject(Authentication auth,
                                                          @RequestBody Map<String, Object> body) {
        UUID userId = extractUserId(auth);
        IndustryProject project = projectService.createProject(
            userId,
            (String) body.get("title"),
            (String) body.get("description"),
            (String) body.get("requiredSkills"),
            (String) body.getOrDefault("difficulty", "MEDIUM"),
            body.get("durationWeeks") != null ? (Integer) body.get("durationWeeks") : 4,
            body.get("maxParticipants") != null ? (Integer) body.get("maxParticipants") : 10,
            body.get("coinReward") != null ? (Integer) body.get("coinReward") : 0,
            body.get("xpReward") != null ? (Integer) body.get("xpReward") : 0,
            body.get("certificateProvided") != null ? (Boolean) body.get("certificateProvided") : false
        );
        return ResponseEntity.ok(project);
    }

    @GetMapping
    public ResponseEntity<?> getPublishedProjects() {
        return ResponseEntity.ok(projectService.getPublishedProjects());
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyProjects(Authentication auth) {
        return ResponseEntity.ok(projectService.getProjectsByCompany(extractUserId(auth)));
    }

    @PostMapping("/{projectId}/apply")
    public ResponseEntity<ProjectApplication> apply(Authentication auth,
                                                     @PathVariable UUID projectId,
                                                     @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(projectService.applyToProject(projectId, extractUserId(auth), body.get("coverLetter")));
    }

    @PostMapping("/application/{applicationId}/select")
    public ResponseEntity<ProjectApplication> selectStudent(Authentication auth,
                                                             @PathVariable UUID applicationId) {
        return ResponseEntity.ok(projectService.selectStudent(applicationId));
    }

    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications(Authentication auth) {
        return ResponseEntity.ok(projectService.getMyApplications(extractUserId(auth)));
    }
}
