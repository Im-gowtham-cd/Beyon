package com.beyon.identity.dto;

import com.beyon.identity.enums.AccountStatus;
import com.beyon.identity.enums.UserRole;

import java.util.UUID;

public class AuthResponse {

    private String accessToken;
    private UserInfo user;

    public AuthResponse(String accessToken, UserInfo user) {
        this.accessToken = accessToken;
        this.user = user;
    }

    public String getAccessToken() { return accessToken; }
    public UserInfo getUser() { return user; }

    public static class UserInfo {
        private UUID id;
        private String email;
        private String name;
        private UserRole role;
        private AccountStatus status;
        private AccountStatus profileStatus;
        private boolean emailVerified;

        public UserInfo(UUID id, String email, String name, UserRole role, AccountStatus status, boolean emailVerified) {
            this(id, email, name, role, status, AccountStatus.INCOMPLETE, emailVerified);
        }

        public UserInfo(UUID id, String email, String name, UserRole role, AccountStatus status, AccountStatus profileStatus, boolean emailVerified) {
            this.id = id;
            this.email = email;
            this.name = name;
            this.role = role;
            this.status = status;
            this.profileStatus = profileStatus;
            this.emailVerified = emailVerified;
        }

        public UUID getId() { return id; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public UserRole getRole() { return role; }
        public AccountStatus getStatus() { return status; }
        public AccountStatus getProfileStatus() { return profileStatus; }
        public boolean isEmailVerified() { return emailVerified; }
    }
}
