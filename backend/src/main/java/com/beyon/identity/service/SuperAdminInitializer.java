package com.beyon.identity.service;

import com.beyon.identity.enums.AccountStatus;
import com.beyon.identity.enums.UserRole;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SuperAdminInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SuperAdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private static class AdminSeed {
        final String email;
        final String password;
        final String displayName;
        final UserRole role;

        AdminSeed(String email, String password, String displayName, UserRole role) {
            this.email = email;
            this.password = password;
            this.displayName = displayName;
            this.role = role;
        }
    }

    @Override
    public void run(String... args) {
        List<AdminSeed> adminAccounts = List.of(
            new AdminSeed("superadmin@beyon.io", "Superadmin@2026", "Platform Administrator", UserRole.PLATFORM_ADMIN),
            new AdminSeed("verifier@beyon.io", "Verifier@2026", "Verification Administrator", UserRole.VERIFICATION_ADMIN),
            new AdminSeed("skillcontent@beyon.io", "Skillcontent@2026", "Content & Skill Administrator", UserRole.CONTENT_ADMIN),
            new AdminSeed("questionsetter@beyon.io", "Questionsetter@2026", "Question Setter", UserRole.QUESTION_SETTER),
            new AdminSeed("supportadmin@beyon.io", "Supportadmin@2026", "Support & Moderation Administrator", UserRole.MODERATION_ADMIN),
            new AdminSeed("analytics@beyon.io", "Analytics@2026", "Analytics Administrator", UserRole.ANALYTICS_ADMIN)
        );

        for (AdminSeed seed : adminAccounts) {
            try {
                User user = userRepository.findByEmail(seed.email)
                        .orElseGet(() -> {
                            User u = new User();
                            u.setEmail(seed.email);
                            return u;
                        });

                user.setDisplayName(seed.displayName);
                user.setRole(seed.role);
                user.setStatus(AccountStatus.ACTIVE);
                user.setProfileStatus(AccountStatus.COMPLETED);
                user.setEmailVerified(true);
                user.setPasswordHash(passwordEncoder.encode(seed.password));

                userRepository.save(user);
                log.info("Admin account seeded & verified: {} ({})", seed.email, seed.role);
            } catch (Exception e) {
                log.error("Failed to seed admin account {}: {}", seed.email, e.getMessage());
            }
        }
    }
}
