package com.beyon.platform.repository;

import com.beyon.platform.model.RolePermissions;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RolePermissionsRepository extends JpaRepository<RolePermissions, UUID> {
    List<RolePermissions> findByRole(String role);
    boolean existsByRoleAndPermissionName(String role, String permissionName);
}
