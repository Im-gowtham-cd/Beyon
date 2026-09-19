package com.beyon.identity.security;

import com.beyon.platform.service.PermissionService;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.UUID;

@Component
public class BeyonPermissionEvaluator implements PermissionEvaluator {

    private final PermissionService permissionService;

    public BeyonPermissionEvaluator(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        if (authentication == null || permission == null) {
            return false;
        }

        UUID userId;
        try {
            userId = UUID.fromString(authentication.getName());
        } catch (Exception e) {
            return false;
        }

        String permStr = permission.toString();
        String[] parts = permStr.split(":", 2);
        String resource = parts[0];
        String action = parts.length > 1 ? parts[1] : "*";

        UUID targetOrgId = null;
        if (targetDomainObject instanceof UUID) {
            targetOrgId = (UUID) targetDomainObject;
        } else if (targetDomainObject instanceof String) {
            try {
                targetOrgId = UUID.fromString((String) targetDomainObject);
            } catch (Exception ignored) {
            }
        }

        return permissionService.hasPermission(userId, resource, action, targetOrgId);
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        if (targetId == null) {
            return hasPermission(authentication, (Object) null, permission);
        }
        return hasPermission(authentication, targetId.toString(), permission);
    }
}
