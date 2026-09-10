package com.beyon.profile.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUtil;
import com.beyon.profile.service.SkillVerificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/skills")
public class SkillVerificationController {

    private final SkillVerificationService skillVerificationService;
    private final JwtUtil jwtUtil;

    public SkillVerificationController(SkillVerificationService skillVerificationService, JwtUtil jwtUtil) {
        this.skillVerificationService = skillVerificationService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/verification-quiz/generate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateVerificationQuiz(
            @RequestBody(required = false) Map<String, Object> body) {
        List<String> skillNames = new ArrayList<>();
        int sampleCount = 5;

        if (body != null) {
            if (body.get("skillNames") instanceof List) {
                List<?> list = (List<?>) body.get("skillNames");
                for (Object item : list) {
                    if (item != null) skillNames.add(item.toString());
                }
            }
            if (body.get("sampleCount") instanceof Number) {
                sampleCount = ((Number) body.get("sampleCount")).intValue();
            }
        }

        Map<String, Object> quiz = skillVerificationService.generateVerificationQuiz(skillNames, sampleCount);
        return ResponseEntity.ok(ApiResponse.ok(quiz));
    }

    @PostMapping("/verification-quiz/evaluate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> evaluateVerificationQuiz(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        UUID userId = null;
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (jwtUtil.isTokenValid(token)) {
                    userId = jwtUtil.getUserId(token);
                }
            }
        } catch (Exception e) {
            // Non-authenticated user during pre-onboarding validation is allowed
        }

        List<Map<String, Object>> answers = new ArrayList<>();
        if (body != null && body.get("answers") instanceof List) {
            List<?> list = (List<?>) body.get("answers");
            for (Object item : list) {
                if (item instanceof Map) {
                    answers.add((Map<String, Object>) item);
                }
            }
        }

        List<String> requestedSkills = new ArrayList<>();
        if (body != null && body.get("skills") instanceof List) {
            List<?> list = (List<?>) body.get("skills");
            for (Object item : list) {
                if (item != null) requestedSkills.add(item.toString());
            }
        }

        Map<String, Object> result = skillVerificationService.evaluateVerificationQuiz(userId, answers, requestedSkills);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
