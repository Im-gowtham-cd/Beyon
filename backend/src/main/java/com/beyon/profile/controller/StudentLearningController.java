package com.beyon.profile.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.profile.model.StudentLearningTopic;
import com.beyon.profile.model.StudentSkillProgress;
import com.beyon.profile.service.StudentLearningService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/learning")
public class StudentLearningController {

    private final StudentLearningService studentLearningService;

    public StudentLearningController(StudentLearningService studentLearningService) {
        this.studentLearningService = studentLearningService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StudentLearningTopic>>> getLearningTopics(Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentLearningService.getLearningTopics(studentId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StudentLearningTopic>> addLearningTopic(Authentication auth, @RequestBody Map<String, String> body) {
        UUID studentId = extractUserId(auth);
        UUID topicId = UUID.fromString(body.get("topicId"));
        return ResponseEntity.ok(ApiResponse.ok(studentLearningService.addLearningTopic(studentId, topicId)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<StudentLearningTopic>> updateStatus(Authentication auth, @PathVariable UUID id, @RequestBody Map<String, String> body) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentLearningService.updateLearningStatus(studentId, id, body.get("status"))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeLearningTopic(Authentication auth, @PathVariable UUID id) {
        UUID studentId = extractUserId(auth);
        studentLearningService.removeLearningTopic(studentId, id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/skills")
    public ResponseEntity<ApiResponse<List<com.beyon.profile.model.StudentLearningSkill>>> getLearningSkills(Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentLearningService.getLearningSkills(studentId)));
    }

    @PostMapping("/skills")
    public ResponseEntity<ApiResponse<com.beyon.profile.model.StudentLearningSkill>> addLearningSkill(Authentication auth, @RequestBody Map<String, String> body) {
        UUID studentId = extractUserId(auth);
        UUID skillId = body.get("skillId") != null && !body.get("skillId").isBlank() ? UUID.fromString(body.get("skillId")) : null;
        String skillName = body.get("skillName");
        return ResponseEntity.ok(ApiResponse.ok(studentLearningService.addLearningSkill(studentId, skillId, skillName)));
    }

    @DeleteMapping("/skills/{skillId}")
    public ResponseEntity<ApiResponse<Void>> removeLearningSkill(Authentication auth, @PathVariable UUID skillId) {
        UUID studentId = extractUserId(auth);
        studentLearningService.removeLearningSkill(studentId, skillId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/progress")
    public ResponseEntity<ApiResponse<List<StudentSkillProgress>>> getProgress(Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentLearningService.getSkillProgress(studentId)));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}

