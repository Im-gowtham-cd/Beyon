package com.beyon.platform.repository;

import com.beyon.platform.model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface PermissionRepository extends JpaRepository<Permission, UUID> {
    @Query("SELECT p.name FROM Permission p JOIN RolePermissions rp ON rp.permission = p WHERE rp.role = :role")
    List<String> findPermissionNamesByRole(String role);
}
