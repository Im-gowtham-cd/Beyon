package com.beyon.profile.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.profile.dto.ProfileResponse;
import com.beyon.profile.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        ProfileResponse profile = profileService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    private UUID extractUserId(Authentication authentication) {
        JwtUserDetails details = (JwtUserDetails) authentication.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
