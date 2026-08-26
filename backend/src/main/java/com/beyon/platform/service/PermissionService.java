package com.beyon.platform.service;

import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.platform.model.Permission;
import com.beyon.platform.model.RolePermissions;
import com.beyon.platform.repository.PermissionRepository;
import com.beyon.platform.repository.RolePermissionsRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PermissionService {

    private final PermissionRepository permissionRepo;
    private final RolePermissionsRepository rolePermRepo;
    private final UserRepository userRepo;

    private static final Map<String, Set<String>> ROLE_PERMISSIONS = new ConcurrentHashMap<>();

    static {
        ROLE_PERMISSIONS.put("STUDENT", Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE", "PRACTICE", "TAKE_ASSESSMENT",
            "VIEW_OPPORTUNITY", "APPLY_OPPORTUNITY", "VIEW_OWN_RESULTS",
            "MANAGE_OWN_COINS", "CREATE_POST", "COMMENT", "FOLLOW",
            "REQUEST_MENTORSHIP", "REGISTER_EVENT", "PARTICIPATE_CHALLENGE",
            "VIEW_OWN_CERTIFICATES", "EXPORT_OWN_DATA", "MANAGE_PRIVACY",
            "REPORT_CONTENT"
        ));
        ROLE_PERMISSIONS.put("INSTITUTION", Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE", "MANAGE_STUDENTS", "MANAGE_PLACEMENTS",
            "VIEW_ANALYTICS", "CREATE_EVENT", "CREATE_POST", "COMMENT",
            "CREATE_LEARNING_PROGRAM", "MANAGE_DEPARTMENTS", "REPORT_CONTENT",
            "VIEW_OWN_CERTIFICATES"
        ));
        ROLE_PERMISSIONS.put("COMPANY", Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE", "CREATE_JOB", "CREATE_ASSESSMENT",
            "MANAGE_APPLICATIONS", "VIEW_CANDIDATES", "VIEW_ANALYTICS",
            "CREATE_CHALLENGE", "CREATE_EVENT", "CREATE_LIVE_PROJECT",
            "CREATE_POST", "COMMENT", "REPORT_CONTENT", "MANAGE_RECRUITMENT"
        ));
        ROLE_PERMISSIONS.put("ADMIN", Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE", "MANAGE_USERS", "MANAGE_ALL",
            "VIEW_ALL_ANALYTICS", "MODERATE_CONTENT", "MANAGE_REPORTS",
            "VIEW_AUDIT_LOGS", "MANAGE_PERMISSIONS", "MANAGE_PLATFORM",
            "REVIEW_FRAUD", "MANAGE_FEEDBACK", "EXPORT_DATA"
        ));
    }

    public PermissionService(PermissionRepository permissionRepo,
                             RolePermissionsRepository rolePermRepo,
                             UserRepository userRepo) {
        this.permissionRepo = permissionRepo;
        this.rolePermRepo = rolePermRepo;
        this.userRepo = userRepo;
    }

    public boolean hasPermission(UUID userId, String permission) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) return false;
        Set<String> perms = ROLE_PERMISSIONS.getOrDefault(user.getRole().name(), Set.of());
        return perms.contains(permission);
    }

    public Set<String> getPermissionsForRole(String role) {
        return ROLE_PERMISSIONS.getOrDefault(role, Set.of());
    }

    public Set<String> getPermissionsForUser(UUID userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) return Set.of();
        return getPermissionsForRole(user.getRole().name());
    }

    public List<String> getAllPermissions() {
        Set<String> all = new HashSet<>();
        ROLE_PERMISSIONS.values().forEach(all::addAll);
        return all.stream().sorted().toList();
    }

    public Map<String, Set<String>> getRolePermissionMatrix() {
        return new HashMap<>(ROLE_PERMISSIONS);
    }
}
