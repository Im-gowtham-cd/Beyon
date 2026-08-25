package com.beyon.identity.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.dto.*;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.identity.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse.UserInfo user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(user));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request,
                                                           HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        String ua = httpRequest.getHeader("User-Agent");
        AuthResponse response = authService.login(request, ip, ua);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> me(Authentication authentication) {
        JwtUserDetails details = (JwtUserDetails) authentication.getDetails();
        UUID userId = UUID.fromString(details.getUserId());
        AuthResponse.UserInfo user = authService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PutMapping("/update-profile")
    public ResponseEntity<ApiResponse<Void>> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        JwtUserDetails details = (JwtUserDetails) authentication.getDetails();
        UUID userId = UUID.fromString(details.getUserId());
        authService.updateProfile(userId, request.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        JwtUserDetails details = (JwtUserDetails) authentication.getDetails();
        UUID userId = UUID.fromString(details.getUserId());
        authService.changePassword(userId, request.getCurrentPassword(), request.getNewPassword(), request.getConfirmPassword());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request.getToken());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.resendVerification(request.getEmail());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
