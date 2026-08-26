package com.beyon.community.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.community.model.ProjectEvaluation;
import com.beyon.community.service.ProjectEvaluationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/project-evaluations")
public class ProjectEvaluationController {

    private final ProjectEvaluationService evalService;

    public ProjectEvaluationController(ProjectEvaluationService evalService) { this.evalService = evalService; }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectEvaluation>> submit(@RequestBody ProjectEvaluation eval, Authentication auth) {
        eval.setEvaluatorId(extractUserId(auth));
        return ResponseEntity.ok(ApiResponse.ok(evalService.submitEvaluation(eval)));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<ProjectEvaluation>>> byProject(@PathVariable UUID projectId) {
        return ResponseEntity.ok(ApiResponse.ok(evalService.getProjectEvaluations(projectId)));
    }

    @GetMapping("/project/{projectId}/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> summary(@PathVariable UUID projectId) {
        return ResponseEntity.ok(ApiResponse.ok(evalService.getEvaluationSummary(projectId)));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
