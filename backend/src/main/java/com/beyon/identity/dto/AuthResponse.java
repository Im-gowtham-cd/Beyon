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
        private String tier;
        private UUID institutionId;
        private UUID companyId;
        private String departmentId;
        private AccountStatus status;
        private AccountStatus profileStatus;
        private boolean emailVerified;

        public UserInfo(UUID id, String email, String name, UserRole role, AccountStatus status, boolean emailVerified) {
            this(id, email, name, role, status, AccountStatus.INCOMPLETE, emailVerified);
        }

        public UserInfo(UUID id, String email, String name, UserRole role, AccountStatus status, AccountStatus profileStatus, boolean emailVerified) {
            this(id, email, name, role, null, null, null, status, profileStatus, emailVerified);
        }

        public UserInfo(UUID id, String email, String name, UserRole role, UUID institutionId, UUID companyId, String departmentId, AccountStatus status, AccountStatus profileStatus, boolean emailVerified) {
            this.id = id;
            this.email = email;
            this.name = name;
            this.role = role;
            this.tier = role != null ? role.getTier() : "STUDENT";
            this.institutionId = institutionId;
            this.companyId = companyId;
            this.departmentId = departmentId;
            this.status = status;
            this.profileStatus = profileStatus;
            this.emailVerified = emailVerified;
        }

        public UUID getId() { return id; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public UserRole getRole() { return role; }
        public String getTier() { return tier; }
        public UUID getInstitutionId() { return institutionId; }
        public UUID getCompanyId() { return companyId; }
        public String getDepartmentId() { return departmentId; }
        public AccountStatus getStatus() { return status; }
        public AccountStatus getProfileStatus() { return profileStatus; }
        public boolean isEmailVerified() { return emailVerified; }
    }
}

