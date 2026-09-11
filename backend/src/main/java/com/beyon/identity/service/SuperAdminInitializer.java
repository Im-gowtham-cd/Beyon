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

@Component
public class SuperAdminInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SuperAdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String superAdminEmail = "superadmin@beyon.io";
        String defaultPassword = "Password123";

        User superAdmin = userRepository.findByEmail(superAdminEmail)
                .orElseGet(() -> {
                    User u = new User();
                    u.setEmail(superAdminEmail);
                    u.setDisplayName("Super Administrator");
                    u.setRole(UserRole.SUPER_ADMIN);
                    u.setStatus(AccountStatus.ACTIVE);
                    u.setProfileStatus(AccountStatus.COMPLETED);
                    u.setEmailVerified(true);
                    return u;
                });

        if (superAdmin.getPasswordHash() == null || superAdmin.getPasswordHash().isBlank()) {
            superAdmin.setPasswordHash(passwordEncoder.encode(defaultPassword));
        }
        superAdmin.setStatus(AccountStatus.ACTIVE);
        superAdmin.setProfileStatus(AccountStatus.COMPLETED);
        superAdmin.setEmailVerified(true);
        superAdmin.setRole(UserRole.SUPER_ADMIN);
        superAdmin.setDisplayName("Super Administrator");

        userRepository.save(superAdmin);
        log.info("Super Admin account verified & initialized: {}", superAdminEmail);
    }
}

