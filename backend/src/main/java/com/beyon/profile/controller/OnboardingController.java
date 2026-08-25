package com.beyon.profile.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.profile.dto.CompanyOnboardingRequest;
import com.beyon.profile.dto.InstitutionOnboardingRequest;
import com.beyon.profile.dto.StudentOnboardingRequest;
import com.beyon.profile.service.OnboardingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/onboarding")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @PostMapping("/student")
    public ResponseEntity<ApiResponse<Void>> createStudentProfile(
            @Valid @RequestBody StudentOnboardingRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        onboardingService.createStudentProfile(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok());
    }

    @PostMapping("/institution")
    public ResponseEntity<ApiResponse<Void>> createInstitutionProfile(
            @Valid @RequestBody InstitutionOnboardingRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        onboardingService.createInstitutionProfile(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok());
    }

    @PostMapping("/company")
    public ResponseEntity<ApiResponse<Void>> createCompanyProfile(
            @Valid @RequestBody CompanyOnboardingRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        onboardingService.createCompanyProfile(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok());
    }

    private UUID extractUserId(Authentication authentication) {
        JwtUserDetails details = (JwtUserDetails) authentication.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
