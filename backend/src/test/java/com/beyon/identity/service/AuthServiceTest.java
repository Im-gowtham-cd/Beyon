package com.beyon.identity.service;

import com.beyon.common.exception.ConflictException;
import com.beyon.common.exception.ForbiddenException;
import com.beyon.common.exception.UnauthorizedException;
import com.beyon.identity.dto.AuthResponse;
import com.beyon.identity.dto.LoginRequest;
import com.beyon.identity.dto.RegisterRequest;
import com.beyon.identity.enums.AccountStatus;
import com.beyon.identity.enums.UserRole;
import com.beyon.identity.model.EmailVerificationToken;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.EmailVerificationTokenRepository;
import com.beyon.identity.repository.PasswordResetTokenRepository;
import com.beyon.identity.repository.UserRepository;
import com.beyon.identity.security.JwtUtil;
import com.beyon.practice.service.CoinService;
import com.beyon.practice.service.StreakService;
import com.beyon.profile.repository.CompanyProfileRepository;
import com.beyon.profile.repository.InstitutionProfileRepository;
import com.beyon.profile.repository.StudentProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    private UserRepository userRepository;
    private EmailVerificationTokenRepository emailVerificationTokenRepository;
    private PasswordResetTokenRepository passwordResetTokenRepository;
    private PasswordEncoder passwordEncoder;
    private JwtUtil jwtUtil;
    private AuditService auditService;
    private RateLimitService rateLimitService;
    private StudentProfileRepository studentProfileRepository;
    private CompanyProfileRepository companyProfileRepository;
    private InstitutionProfileRepository institutionProfileRepository;
    private CoinService coinService;
    private StreakService streakService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        emailVerificationTokenRepository = mock(EmailVerificationTokenRepository.class);
        passwordResetTokenRepository = mock(PasswordResetTokenRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        jwtUtil = mock(JwtUtil.class);
        auditService = mock(AuditService.class);
        rateLimitService = mock(RateLimitService.class);
        studentProfileRepository = mock(StudentProfileRepository.class);
        companyProfileRepository = mock(CompanyProfileRepository.class);
        institutionProfileRepository = mock(InstitutionProfileRepository.class);
        coinService = mock(CoinService.class);
        streakService = mock(StreakService.class);

        authService = new AuthService(
                userRepository,
                emailVerificationTokenRepository,
                passwordResetTokenRepository,
                passwordEncoder,
                jwtUtil,
                auditService,
                rateLimitService,
                studentProfileRepository,
                companyProfileRepository,
                institutionProfileRepository,
                coinService,
                streakService
        );
    }

    @Test
    @DisplayName("Register student successfully creates user, profile, bonus coins and token")
    void testRegisterStudentSuccess() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Gowtham Candidate");
        req.setEmail("gowtham@example.com");
        req.setPassword("SecurePass123!");
        req.setConfirmPassword("SecurePass123!");
        req.setRole(UserRole.STUDENT);

        when(userRepository.existsByEmail("gowtham@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_secret");

        UUID generatedId = UUID.randomUUID();
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(generatedId);
            return u;
        });

        AuthResponse.UserInfo info = authService.register(req);

        assertNotNull(info);
        assertEquals("gowtham@example.com", info.getEmail());
        assertEquals("Gowtham Candidate", info.getName());
        assertEquals(UserRole.STUDENT, info.getRole());

        verify(studentProfileRepository).save(any());
        verify(coinService).earnCoins(eq(generatedId), eq("WELCOME_BONUS"), eq("REGISTRATION"), eq(generatedId));
        verify(emailVerificationTokenRepository).save(any(EmailVerificationToken.class));
    }

    @Test
    @DisplayName("Register rejects admin role registration with ForbiddenException")
    void testRegisterAdminForbidden() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Hacker");
        req.setEmail("hacker@beyon.internal");
        req.setPassword("AdminPass123!");
        req.setConfirmPassword("AdminPass123!");
        req.setRole(UserRole.SUPER_ADMIN);

        assertThrows(ForbiddenException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Register rejects mismatched passwords")
    void testRegisterPasswordMismatch() {
        RegisterRequest req = new RegisterRequest();
        req.setName("User");
        req.setEmail("user@example.com");
        req.setPassword("Pass123456!");
        req.setConfirmPassword("Different123!");
        req.setRole(UserRole.STUDENT);

        assertThrows(IllegalArgumentException.class, () -> authService.register(req));
    }

    @Test
    @DisplayName("Register rejects duplicate email with ConflictException")
    void testRegisterDuplicateEmail() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Existing");
        req.setEmail("existing@example.com");
        req.setPassword("ValidPassword123!");
        req.setConfirmPassword("ValidPassword123!");
        req.setRole(UserRole.STUDENT);

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Login successful issues JWT token and records login timestamp")
    void testLoginSuccess() {
        LoginRequest req = new LoginRequest();
        req.setEmail("student@beyon.com");
        req.setPassword("ValidPassword123!");

        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        user.setEmail("student@beyon.com");
        user.setPasswordHash("hashed_val");
        user.setRole(UserRole.STUDENT);
        user.setStatus(AccountStatus.ACTIVE);
        user.setProfileStatus(AccountStatus.COMPLETED);

        when(userRepository.findByEmail("student@beyon.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("ValidPassword123!", "hashed_val")).thenReturn(true);
        when(jwtUtil.generateAccessToken(eq(userId), eq("student@beyon.com"), eq("STUDENT"), any(), any(), any()))
                .thenReturn("mocked.jwt.token");

        AuthResponse resp = authService.login(req, "127.0.0.1", "JUnit-Agent");

        assertNotNull(resp);
        assertEquals("mocked.jwt.token", resp.getAccessToken());
        assertEquals("student@beyon.com", resp.getUser().getEmail());
        assertNotNull(user.getLastLoginAt());
        verify(userRepository).save(user);
        verify(rateLimitService).reset("login:student@beyon.com");
    }

    @Test
    @DisplayName("Login rejects incorrect password with UnauthorizedException")
    void testLoginWrongPassword() {
        LoginRequest req = new LoginRequest();
        req.setEmail("student@beyon.com");
        req.setPassword("WrongPassword");

        User user = new User();
        user.setEmail("student@beyon.com");
        user.setPasswordHash("hashed_val");

        when(userRepository.findByEmail("student@beyon.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "hashed_val")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login(req, "127.0.0.1", "JUnit-Agent"));
    }

    @Test
    @DisplayName("Login blocks suspended user with ForbiddenException")
    void testLoginSuspendedUser() {
        LoginRequest req = new LoginRequest();
        req.setEmail("banned@beyon.com");
        req.setPassword("Password123!");

        User user = new User();
        user.setEmail("banned@beyon.com");
        user.setPasswordHash("hashed_val");
        user.setStatus(AccountStatus.SUSPENDED);

        when(userRepository.findByEmail("banned@beyon.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123!", "hashed_val")).thenReturn(true);

        assertThrows(ForbiddenException.class, () -> authService.login(req, "127.0.0.1", "JUnit-Agent"));
    }

    @Test
    @DisplayName("Change password updates hash when current password matches")
    void testChangePasswordSuccess() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        user.setPasswordHash("old_hashed");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("OldPass123!", "old_hashed")).thenReturn(true);
        when(passwordEncoder.encode("NewSecurePass456!")).thenReturn("new_hashed");

        authService.changePassword(userId, "OldPass123!", "NewSecurePass456!", "NewSecurePass456!");

        assertEquals("new_hashed", user.getPasswordHash());
        verify(userRepository).save(user);
    }
}
