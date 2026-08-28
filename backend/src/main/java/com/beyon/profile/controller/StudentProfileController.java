package com.beyon.profile.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.profile.dto.*;
import com.beyon.profile.model.*;
import com.beyon.profile.service.StudentProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student")
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    public StudentProfileController(StudentProfileService studentProfileService) {
        this.studentProfileService = studentProfileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<StudentProfile>> getProfile(Authentication auth) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.getProfile(userId)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<StudentProfile>> updateProfile(Authentication auth, @RequestBody UpdateStudentProfileRequest req) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.updateProfile(userId, req)));
    }

    @GetMapping("/profile/completion")
    public ResponseEntity<ApiResponse<Integer>> getCompletion(Authentication auth) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.calculateCompletion(userId)));
    }

    @GetMapping("/skills")
    public ResponseEntity<ApiResponse<List<StudentSkill>>> getSkills(Authentication auth) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.getSkills(userId)));
    }

    @PostMapping("/skills")
    public ResponseEntity<ApiResponse<StudentSkill>> addSkill(Authentication auth, @RequestBody StudentSkillRequest req) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.addSkill(userId, req)));
    }

    @DeleteMapping("/skills/{skillId}")
    public ResponseEntity<ApiResponse<Void>> removeSkill(Authentication auth, @PathVariable UUID skillId) {
        UUID userId = extractUserId(auth);
        studentProfileService.removeSkill(userId, skillId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<StudentProject>>> getProjects(Authentication auth) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.getProjects(userId)));
    }

    @PostMapping("/projects")
    public ResponseEntity<ApiResponse<StudentProject>> addProject(Authentication auth, @RequestBody StudentProjectRequest req) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.addProject(userId, req)));
    }

    @PutMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponse<StudentProject>> updateProject(Authentication auth, @PathVariable UUID projectId, @RequestBody StudentProjectRequest req) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.updateProject(userId, projectId, req)));
    }

    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponse<Void>> removeProject(Authentication auth, @PathVariable UUID projectId) {
        UUID userId = extractUserId(auth);
        studentProfileService.removeProject(userId, projectId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/certifications")
    public ResponseEntity<ApiResponse<List<StudentCertification>>> getCertifications(Authentication auth) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.getCertifications(userId)));
    }

    @PostMapping("/certifications")
    public ResponseEntity<ApiResponse<StudentCertification>> addCertification(Authentication auth, @RequestBody StudentCertificationRequest req) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.addCertification(userId, req)));
    }

    @PutMapping("/certifications/{certId}")
    public ResponseEntity<ApiResponse<StudentCertification>> updateCertification(Authentication auth, @PathVariable UUID certId, @RequestBody StudentCertificationRequest req) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.updateCertification(userId, certId, req)));
    }

    @DeleteMapping("/certifications/{certId}")
    public ResponseEntity<ApiResponse<Void>> removeCertification(Authentication auth, @PathVariable UUID certId) {
        UUID userId = extractUserId(auth);
        studentProfileService.removeCertification(userId, certId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/achievements")
    public ResponseEntity<ApiResponse<List<StudentAchievement>>> getAchievements(Authentication auth) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.getAchievements(userId)));
    }

    @PostMapping("/achievements")
    public ResponseEntity<ApiResponse<StudentAchievement>> addAchievement(Authentication auth, @RequestBody StudentAchievementRequest req) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.addAchievement(userId, req)));
    }

    @PutMapping("/achievements/{achievementId}")
    public ResponseEntity<ApiResponse<StudentAchievement>> updateAchievement(Authentication auth, @PathVariable UUID achievementId, @RequestBody StudentAchievementRequest req) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.updateAchievement(userId, achievementId, req)));
    }

    @DeleteMapping("/achievements/{achievementId}")
    public ResponseEntity<ApiResponse<Void>> removeAchievement(Authentication auth, @PathVariable UUID achievementId) {
        UUID userId = extractUserId(auth);
        studentProfileService.removeAchievement(userId, achievementId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/links")
    public ResponseEntity<ApiResponse<List<StudentLink>>> getLinks(Authentication auth) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.getLinks(userId)));
    }

    @PostMapping("/links")
    public ResponseEntity<ApiResponse<StudentLink>> addLink(Authentication auth, @RequestBody StudentLinkRequest req) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.addLink(userId, req)));
    }

    @DeleteMapping("/links/{linkId}")
    public ResponseEntity<ApiResponse<Void>> removeLink(Authentication auth, @PathVariable UUID linkId) {
        UUID userId = extractUserId(auth);
        studentProfileService.removeLink(userId, linkId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/learning-skills")
    public ResponseEntity<ApiResponse<List<StudentLearningSkill>>> getLearningSkills(Authentication auth) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.getLearningSkills(userId)));
    }

    @PostMapping("/learning-skills")
    public ResponseEntity<ApiResponse<StudentLearningSkill>> addLearningSkill(Authentication auth, @RequestBody StudentLearningSkillRequest req) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.addLearningSkill(userId, req)));
    }

    @DeleteMapping("/learning-skills/{learningId}")
    public ResponseEntity<ApiResponse<Void>> removeLearningSkill(Authentication auth, @PathVariable UUID learningId) {
        UUID userId = extractUserId(auth);
        studentProfileService.removeLearningSkill(userId, learningId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/career-preferences")
    public ResponseEntity<ApiResponse<StudentCareerPreferences>> getCareerPreferences(Authentication auth) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.getCareerPreferences(userId)));
    }

    @PutMapping("/career-preferences")
    public ResponseEntity<ApiResponse<StudentCareerPreferences>> updateCareerPreferences(Authentication auth, @RequestBody StudentCareerPreferencesRequest req) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.updateCareerPreferences(userId, req)));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
