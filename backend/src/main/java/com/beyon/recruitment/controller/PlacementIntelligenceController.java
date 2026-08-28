package com.beyon.recruitment.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.recruitment.model.*;
import com.beyon.recruitment.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/intelligence")
public class PlacementIntelligenceController {

    private final PlacementVerificationService verifyService;
    private final InstitutionRatingService ratingService;
    private final CompanyTierService tierService;
    private final PlacementReadinessService readinessService;
    private final CareerOutcomeService outcomeService;
    private final AlumniService alumniService;
    private final ReferralService referralService;

    public PlacementIntelligenceController(PlacementVerificationService verifyService,
                                            InstitutionRatingService ratingService,
                                            CompanyTierService tierService,
                                            PlacementReadinessService readinessService,
                                            CareerOutcomeService outcomeService,
                                            AlumniService alumniService,
                                            ReferralService referralService) {
        this.verifyService = verifyService;
        this.ratingService = ratingService;
        this.tierService = tierService;
        this.readinessService = readinessService;
        this.outcomeService = outcomeService;
        this.alumniService = alumniService;
        this.referralService = referralService;
    }

    // Phase 171: Placement Verification
    @PostMapping("/verification/request/{placementRecordId}")
    public ResponseEntity<ApiResponse<PlacementVerification>> requestVerification(
            @PathVariable UUID placementRecordId, @RequestBody Map<String, String> body, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(verifyService.requestVerification(placementRecordId, extractUserId(auth), body.get("source"))));
    }

    @PostMapping("/verification/{id}/company-verify")
    public ResponseEntity<ApiResponse<PlacementVerification>> companyVerify(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(verifyService.companyVerify(id, extractUserId(auth))));
    }

    @PostMapping("/verification/{id}/institution-verify")
    public ResponseEntity<ApiResponse<PlacementVerification>> institutionVerify(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(verifyService.institutionVerify(id, extractUserId(auth))));
    }

    @PostMapping("/verification/{id}/student-confirm")
    public ResponseEntity<ApiResponse<PlacementVerification>> studentConfirm(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(verifyService.studentConfirm(id, extractUserId(auth))));
    }

    @PostMapping("/verification/{id}/reject")
    public ResponseEntity<ApiResponse<PlacementVerification>> reject(@PathVariable UUID id, @RequestBody Map<String, String> body, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(verifyService.reject(id, extractUserId(auth), body.get("reason"))));
    }

    @GetMapping("/verification/my")
    public ResponseEntity<ApiResponse<List<PlacementVerification>>> myVerifications(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(verifyService.getMyVerifications(extractUserId(auth))));
    }

    @GetMapping("/verification/pending")
    public ResponseEntity<ApiResponse<List<PlacementVerification>>> pendingVerifications() {
        return ResponseEntity.ok(ApiResponse.ok(verifyService.getPendingVerifications()));
    }

    // Phase 172: Institution Rating
    @GetMapping("/rating/institution/{institutionId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInstitutionRating(@PathVariable UUID institutionId) {
        return ResponseEntity.ok(ApiResponse.ok(ratingService.getRating(institutionId)));
    }

    @PostMapping("/rating/institution/{institutionId}/calculate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateInstitutionRating(
            @PathVariable UUID institutionId, @RequestParam(defaultValue = "2026") Integer year) {
        return ResponseEntity.ok(ApiResponse.ok(ratingService.calculateAndSave(institutionId, year)));
    }

    // Phase 173: Company Tier
    @GetMapping("/tier/company/{companyId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCompanyTier(@PathVariable UUID companyId) {
        return ResponseEntity.ok(ApiResponse.ok(tierService.calculateAndSave(companyId)));
    }

    @GetMapping("/tier/my")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyCompanyTier(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(tierService.calculateAndSave(extractUserId(auth))));
    }

    // Phase 175: Placement Readiness
    @GetMapping("/readiness/my")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyReadiness(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(readinessService.calculateAndSave(extractUserId(auth))));
    }

    @GetMapping("/readiness/{studentId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReadiness(@PathVariable UUID studentId) {
        return ResponseEntity.ok(ApiResponse.ok(readinessService.calculateAndSave(studentId)));
    }

    // Phase 177: Career Outcomes
    @PostMapping("/outcomes")
    public ResponseEntity<ApiResponse<CareerOutcome>> createOutcome(@RequestBody CareerOutcome outcome, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(outcomeService.createOutcome(extractUserId(auth), outcome)));
    }

    @GetMapping("/outcomes/my")
    public ResponseEntity<ApiResponse<List<CareerOutcome>>> myOutcomes(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(outcomeService.getMyOutcomes(extractUserId(auth))));
    }

    @GetMapping("/outcomes/{studentId}/timeline")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTimeline(@PathVariable UUID studentId) {
        return ResponseEntity.ok(ApiResponse.ok(outcomeService.getOutcomeTimeline(studentId)));
    }

    // Phase 178: Alumni Network
    @PostMapping("/alumni/profile")
    public ResponseEntity<ApiResponse<AlumniProfile>> createAlumniProfile(@RequestBody AlumniProfile profile, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(alumniService.createOrUpdateProfile(extractUserId(auth), profile)));
    }

    @GetMapping("/alumni/profile")
    public ResponseEntity<ApiResponse<AlumniProfile>> myAlumniProfile(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(alumniService.getProfile(extractUserId(auth)).orElse(null)));
    }

    @GetMapping("/alumni/browse/{institutionId}")
    public ResponseEntity<ApiResponse<List<AlumniProfile>>> browseAlumni(@PathVariable UUID institutionId) {
        return ResponseEntity.ok(ApiResponse.ok(alumniService.browseAlumni(institutionId)));
    }

    @GetMapping("/alumni/mentors")
    public ResponseEntity<ApiResponse<List<AlumniProfile>>> getMentors() {
        return ResponseEntity.ok(ApiResponse.ok(alumniService.getMentors()));
    }

    @PostMapping("/alumni/connect/{alumniId}")
    public ResponseEntity<ApiResponse<AlumniConnection>> connect(
            @PathVariable UUID alumniId, @RequestBody Map<String, String> body, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(alumniService.connect(alumniId, extractUserId(auth), body.getOrDefault("type", "FOLLOW"), body.get("message"))));
    }

    @PostMapping("/alumni/connection/{connectionId}/respond")
    public ResponseEntity<ApiResponse<AlumniConnection>> respondConnection(
            @PathVariable UUID connectionId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(alumniService.respondToConnection(connectionId, body.get("status"))));
    }

    @GetMapping("/alumni/connections/my")
    public ResponseEntity<ApiResponse<List<AlumniConnection>>> myConnections(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(alumniService.getMyConnections(extractUserId(auth))));
    }

    // Phase 179: Referrals
    @PostMapping("/referrals")
    public ResponseEntity<ApiResponse<OpportunityReferral>> createReferral(@RequestBody OpportunityReferral referral, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(referralService.createReferral(extractUserId(auth), referral)));
    }

    @GetMapping("/referrals/my")
    public ResponseEntity<ApiResponse<List<OpportunityReferral>>> myReferrals(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(referralService.getMyReferrals(extractUserId(auth))));
    }

    @GetMapping("/referrals/active")
    public ResponseEntity<ApiResponse<List<OpportunityReferral>>> activeReferrals() {
        return ResponseEntity.ok(ApiResponse.ok(referralService.getActiveReferrals()));
    }

    @GetMapping("/referrals/{id}")
    public ResponseEntity<ApiResponse<OpportunityReferral>> getReferral(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(referralService.getReferral(id)));
    }

    @PostMapping("/referrals/{id}/click")
    public ResponseEntity<ApiResponse<Map<String, Object>>> trackClick(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(referralService.trackClick(id, extractUserId(auth))));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
