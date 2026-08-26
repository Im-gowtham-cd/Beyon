package com.beyon.profile.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.profile.model.*;
import com.beyon.profile.service.ProfessionalIdentityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/professional")
public class ProfessionalIdentityController {

    private final ProfessionalIdentityService identityService;

    public ProfessionalIdentityController(ProfessionalIdentityService identityService) {
        this.identityService = identityService;
    }

    // Phase 181: Certificates
    @PostMapping("/certificates/generate")
    public ResponseEntity<ApiResponse<BeyonCertificate>> generateCertificate(@RequestBody Map<String, Object> body, Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(identityService.generateCertificate(studentId,
            (String) body.get("type"), (String) body.get("title"), (String) body.get("skillName"),
            (String) body.get("issuerName"), body.get("score") != null ? Integer.parseInt(body.get("score").toString()) : null)));
    }

    // Phase 182: Credential Verification
    @GetMapping("/verify/{certificateNumber}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyCredential(@PathVariable String certificateNumber) {
        return ResponseEntity.ok(ApiResponse.ok(identityService.verifyCredential(certificateNumber)));
    }

    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyByQuery(@RequestParam String number) {
        return ResponseEntity.ok(ApiResponse.ok(identityService.verifyCredential(number)));
    }

    // Phase 184: Endorsements
    @PostMapping("/endorsements")
    public ResponseEntity<ApiResponse<SkillEndorsement>> endorseSkill(@RequestBody Map<String, String> body, Authentication auth) {
        UUID endorserId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(identityService.endorseSkill(
            UUID.fromString(body.get("studentId")), UUID.fromString(body.get("skillId")),
            endorserId, body.get("endorserName"), body.get("endorserType"), body.get("level"))));
    }

    @GetMapping("/endorsements/my")
    public ResponseEntity<ApiResponse<List<SkillEndorsement>>> myEndorsements(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(identityService.getMyEndorsements(extractUserId(auth))));
    }

    @GetMapping("/endorsements/summary/{studentId}/{skillId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> endorsementSummary(@PathVariable UUID studentId, @PathVariable UUID skillId) {
        return ResponseEntity.ok(ApiResponse.ok(identityService.getSkillEndorsementSummary(studentId, skillId)));
    }

    // Phase 185: Professional Profile
    @PostMapping("/profile")
    public ResponseEntity<ApiResponse<ProfessionalProfile>> updateProfile(@RequestBody ProfessionalProfile profile, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(identityService.createOrUpdateProfile(extractUserId(auth), profile)));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> myProfile(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(identityService.getProfessionalProfile(extractUserId(auth))));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> publicProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.ok(identityService.getProfessionalProfile(userId)));
    }

    // Phase 186: Portfolio Builder
    @PostMapping("/projects")
    public ResponseEntity<ApiResponse<PortfolioProject>> addProject(@RequestBody PortfolioProject project, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(identityService.addProject(extractUserId(auth), project)));
    }

    @GetMapping("/projects/my")
    public ResponseEntity<ApiResponse<List<PortfolioProject>>> myProjects(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(identityService.getMyProjects(extractUserId(auth))));
    }

    @PutMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponse<PortfolioProject>> updateProject(
            @PathVariable UUID projectId, @RequestBody PortfolioProject project, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(identityService.updateProject(projectId, extractUserId(auth), project)));
    }

    @PostMapping("/projects/{projectId}/feature")
    public ResponseEntity<ApiResponse<PortfolioProject>> toggleFeatured(@PathVariable UUID projectId, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(identityService.toggleFeatured(projectId, extractUserId(auth))));
    }

    // Phase 187: Portfolio Verification
    @PostMapping("/projects/{projectId}/verify-request")
    public ResponseEntity<ApiResponse<PortfolioVerification>> requestVerification(
            @PathVariable UUID projectId, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(identityService.requestVerification(projectId, extractUserId(auth), "SELF")));
    }

    @PostMapping("/verifications/{verificationId}/respond")
    public ResponseEntity<ApiResponse<PortfolioVerification>> respondVerification(
            @PathVariable UUID verificationId, @RequestBody Map<String, String> body, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(identityService.respondToVerification(verificationId, body.get("status"), extractUserId(auth))));
    }

    // Phase 189: Resume Generator
    @PostMapping("/resume/generate")
    public ResponseEntity<ApiResponse<GeneratedResume>> generateResume(@RequestBody Map<String, String> body, Authentication auth) {
        UUID templateId = body.get("templateId") != null ? UUID.fromString(body.get("templateId")) : null;
        return ResponseEntity.ok(ApiResponse.ok(identityService.generateResume(extractUserId(auth), templateId)));
    }

    @GetMapping("/resume/my")
    public ResponseEntity<ApiResponse<List<GeneratedResume>>> myResumes(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(identityService.getMyResumes(extractUserId(auth))));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
