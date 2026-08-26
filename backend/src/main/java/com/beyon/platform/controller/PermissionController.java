package com.beyon.platform.controller;

import com.beyon.platform.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyPermissions(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(permissionService.getPermissionsForUser(userId));
    }

    @GetMapping("/check/{permission}")
    public ResponseEntity<?> checkPermission(Authentication auth, @PathVariable String permission) {
        UUID userId = UUID.fromString(auth.getName());
        boolean has = permissionService.hasPermission(userId, permission);
        return ResponseEntity.ok(Map.of("permission", permission, "granted", has));
    }

    @GetMapping("/matrix")
    public ResponseEntity<?> getRoleMatrix() {
        return ResponseEntity.ok(permissionService.getRolePermissionMatrix());
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllPermissions() {
        return ResponseEntity.ok(permissionService.getAllPermissions());
    }
}
