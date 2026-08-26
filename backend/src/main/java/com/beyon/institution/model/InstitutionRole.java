package com.beyon.institution.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "institution_roles", uniqueConstraints = @UniqueConstraint(columnNames = {"institution_user_id", "role_type"}))
public class InstitutionRole {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private UUID institutionUserId;

    @Column(nullable = false, length = 50)
    private String roleType;

    @Column(length = 200)
    private String department;

    @Column(columnDefinition = "TEXT")
    private String permissions;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getInstitutionUserId() { return institutionUserId; }
    public void setInstitutionUserId(UUID institutionUserId) { this.institutionUserId = institutionUserId; }
    public String getRoleType() { return roleType; }
    public void setRoleType(String roleType) { this.roleType = roleType; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getPermissions() { return permissions; }
    public void setPermissions(String permissions) { this.permissions = permissions; }
    public Instant getCreatedAt() { return createdAt; }
}
