package com.beyon.identity.service;

import com.beyon.common.exception.ConflictException;
import com.beyon.common.exception.ForbiddenException;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.common.exception.UnauthorizedException;
import com.beyon.identity.dto.*;
import com.beyon.identity.enums.AuditEventType;
import com.beyon.identity.enums.AccountStatus;
import com.beyon.identity.enums.UserRole;
import com.beyon.identity.model.EmailVerificationToken;
import com.beyon.identity.model.PasswordResetToken;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.EmailVerificationTokenRepository;
import com.beyon.identity.repository.PasswordResetTokenRepository;
import com.beyon.identity.repository.UserRepository;
import com.beyon.identity.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuditService auditService;
    private final RateLimitService rateLimitService;

    public AuthService(UserRepository userRepository,
                       EmailVerificationTokenRepository emailVerificationTokenRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuditService auditService,
                       RateLimitService rateLimitService) {
        this.userRepository = userRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.auditService = auditService;
        this.rateLimitService = rateLimitService;
    }

    @Transactional
    public AuthResponse.UserInfo register(RegisterRequest request) {
        if (request.getRole() == UserRole.ADMIN) {
            throw new ForbiddenException("Admin registration is not allowed");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        validatePasswordStrength(request.getPassword());

        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new ConflictException("An account with this email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setDisplayName(request.getName());
        user.setRole(request.getRole());
        user.setStatus(AccountStatus.PENDING_VERIFICATION);
        user.setProfileStatus(AccountStatus.INCOMPLETE);
        user.setEmailVerified(false);
        userRepository.save(user);

        createEmailVerificationToken(user.getId());

        auditService.log(AuditEventType.REGISTRATION, user.getEmail(), null, null);

        return buildUserInfo(user);
    }

    public AuthResponse login(LoginRequest request, String ipAddress, String userAgent) {
        String rateLimitKey = "login:" + request.getEmail().toLowerCase();
        if (rateLimitService.isRateLimited(rateLimitKey, 5, Duration.ofMinutes(15))) {
            throw new UnauthorizedException("Too many login attempts. Please try again later.");
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            auditService.log(AuditEventType.LOGIN_FAILURE, request.getEmail(), ipAddress, userAgent);
            throw new UnauthorizedException("Email or password is incorrect");
        }

        if (user.getStatus() == AccountStatus.SUSPENDED) {
            throw new ForbiddenException("Your account has been suspended");
        }

        if (user.getStatus() == AccountStatus.DEACTIVATED) {
            throw new ForbiddenException("Your account has been deactivated");
        }

        rateLimitService.reset(rateLimitKey);

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        String token = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());

        auditService.log(AuditEventType.LOGIN_SUCCESS, user.getEmail(), ipAddress, userAgent);

        AuthResponse.UserInfo userInfo = buildUserInfo(user);

        return new AuthResponse(token, userInfo);
    }

    public AuthResponse.UserInfo getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return buildUserInfo(user);
    }

    @Transactional
    public void updateProfile(UUID userId, String displayName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (displayName != null && !displayName.isBlank()) {
            user.setDisplayName(displayName);
        }
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword, String confirmPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("New passwords do not match");
        }

        validatePasswordStrength(newPassword);

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        auditService.log(AuditEventType.PASSWORD_RESET_COMPLETED, user.getEmail(), null, null);
    }

    @Transactional
    public void verifyEmail(String tokenValue) {
        String tokenHash = hashToken(tokenValue);

        EmailVerificationToken token = emailVerificationTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid verification token"));

        if (token.isConsumed()) {
            throw new ConflictException("This verification token has already been used");
        }

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("This verification token has expired");
        }

        token.setConsumed(true);
        emailVerificationTokenRepository.save(token);

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setEmailVerified(true);
        user.setStatus(AccountStatus.ACTIVE);
        userRepository.save(user);

        auditService.log(AuditEventType.EMAIL_VERIFIED, user.getEmail(), null, null);
    }

    @Transactional
    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElse(null);

        if (user != null && !user.isEmailVerified()) {
            emailVerificationTokenRepository.findByUserIdAndConsumedFalse(user.getId())
                    .ifPresent(existing -> {
                        existing.setConsumed(true);
                        emailVerificationTokenRepository.save(existing);
                    });

            createEmailVerificationToken(user.getId());
            auditService.log(AuditEventType.EMAIL_VERIFICATION_REQUESTED, user.getEmail(), null, null);
        }
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElse(null);

        if (user != null) {
            passwordResetTokenRepository.findByUserIdAndConsumedFalse(user.getId())
                    .ifPresent(existing -> {
                        existing.setConsumed(true);
                        passwordResetTokenRepository.save(existing);
                    });

            String tokenValue = UUID.randomUUID().toString();
            PasswordResetToken token = new PasswordResetToken();
            token.setUserId(user.getId());
            token.setTokenHash(hashToken(tokenValue));
            token.setExpiresAt(Instant.now().plus(Duration.ofHours(1)));
            passwordResetTokenRepository.save(token);

            auditService.log(AuditEventType.PASSWORD_RESET_REQUESTED, user.getEmail(), null, null);
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        validatePasswordStrength(request.getPassword());

        String tokenHash = hashToken(request.getToken());

        PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid reset token"));

        if (token.isConsumed()) {
            throw new ConflictException("This reset token has already been used");
        }

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("This reset token has expired");
        }

        token.setConsumed(true);
        passwordResetTokenRepository.save(token);

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        auditService.log(AuditEventType.PASSWORD_RESET_COMPLETED, user.getEmail(), null, null);
    }

    private AuthResponse.UserInfo buildUserInfo(User user) {
        return new AuthResponse.UserInfo(
                user.getId(), user.getEmail(), user.getDisplayName(),
                user.getRole(), user.getStatus(), user.getProfileStatus(),
                user.isEmailVerified());
    }

    private void createEmailVerificationToken(UUID userId) {
        String tokenValue = UUID.randomUUID().toString();
        EmailVerificationToken token = new EmailVerificationToken();
        token.setUserId(userId);
        token.setTokenHash(hashToken(tokenValue));
        token.setExpiresAt(Instant.now().plus(Duration.ofHours(24)));
        emailVerificationTokenRepository.save(token);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private void validatePasswordStrength(String password) {
        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
        if (password.length() > 128) {
            throw new IllegalArgumentException("Password must not exceed 128 characters");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new IllegalArgumentException("Password must contain at least one lowercase letter");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new IllegalArgumentException("Password must contain at least one number");
        }
    }
}
