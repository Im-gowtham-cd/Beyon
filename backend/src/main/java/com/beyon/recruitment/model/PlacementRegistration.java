package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "placement_registrations")
public class PlacementRegistration {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false, unique = true) private UUID studentId;
    @Column(name = "institution_id") private UUID institutionId;
    @Column(name = "placement_preference", nullable = false, length = 20) private String placementPreference = "UNDECIDED";
    @Column(name = "preferred_roles", columnDefinition = "text") private String preferredRoles;
    @Column(name = "preferred_locations", columnDefinition = "text") private String preferredLocations;
    @Column(name = "preferred_work_mode", length = 30) private String preferredWorkMode;
    @Column(name = "min_expected_package", precision = 12, scale = 2) private BigDecimal minExpectedPackage;
    @Column(name = "registered_at", nullable = false) private OffsetDateTime registeredAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public PlacementRegistration() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getInstitutionId() { return institutionId; } public void setInstitutionId(UUID v) { this.institutionId = v; }
    public String getPlacementPreference() { return placementPreference; } public void setPlacementPreference(String v) { this.placementPreference = v; }
    public String getPreferredRoles() { return preferredRoles; } public void setPreferredRoles(String v) { this.preferredRoles = v; }
    public String getPreferredLocations() { return preferredLocations; } public void setPreferredLocations(String v) { this.preferredLocations = v; }
    public String getPreferredWorkMode() { return preferredWorkMode; } public void setPreferredWorkMode(String v) { this.preferredWorkMode = v; }
    public BigDecimal getMinExpectedPackage() { return minExpectedPackage; } public void setMinExpectedPackage(BigDecimal v) { this.minExpectedPackage = v; }
    public OffsetDateTime getRegisteredAt() { return registeredAt; } public void setRegisteredAt(OffsetDateTime v) { this.registeredAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
