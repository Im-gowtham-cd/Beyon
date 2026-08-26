package com.beyon.practice.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.practice.model.CompanyOpportunity;
import com.beyon.practice.model.OpportunityApplication;
import com.beyon.practice.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/opportunities")
public class CompanyOpportunityController {

    private final CompanyService companyService;

    public CompanyOpportunityController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CompanyOpportunity>>> getOpportunities(
            @RequestParam(required = false) UUID companyId) {
        if (companyId != null) {
            return ResponseEntity.ok(ApiResponse.ok(companyService.getCompanyOpportunities(companyId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(companyService.getPublishedOpportunities()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyOpportunity>> getOpportunity(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(companyService.getOpportunity(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CompanyOpportunity>> createOpportunity(Authentication auth, @RequestBody CompanyOpportunity opp) {
        UUID companyUserId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(companyService.createOpportunity(companyUserId, opp)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyOpportunity>> updateOpportunity(Authentication auth, @PathVariable UUID id, @RequestBody CompanyOpportunity opp) {
        UUID companyUserId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(companyService.updateOpportunity(id, opp, companyUserId)));
    }

    @GetMapping("/{id}/eligibility")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkEligibility(Authentication auth, @PathVariable UUID id) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(companyService.checkEligibility(studentId, id)));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<ApiResponse<OpportunityApplication>> apply(Authentication auth, @PathVariable UUID id) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(companyService.applyToOpportunity(studentId, id)));
    }

    @GetMapping("/my-applications")
    public ResponseEntity<ApiResponse<List<OpportunityApplication>>> getMyApplications(Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(companyService.getApplications(studentId)));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
