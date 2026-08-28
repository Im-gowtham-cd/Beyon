package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_portfolio_items")
public class StudentPortfolioItem {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "item_type", nullable = false, length = 50) private String itemType;
    @Column(nullable = false, length = 300) private String title;
    @Column(columnDefinition = "text") private String description;
    @Column(length = 200) private String organization;
    @Column(name = "issued_date") private LocalDate issuedDate;
    @Column(name = "credential_url", length = 500) private String credentialUrl;
    @Column(nullable = false) private Boolean verified = false;
    @Column(name = "verified_by") private UUID verifiedBy;
    @Column(columnDefinition = "text") private String metadata;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public StudentPortfolioItem() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public String getItemType() { return itemType; } public void setItemType(String v) { this.itemType = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public String getOrganization() { return organization; } public void setOrganization(String v) { this.organization = v; }
    public LocalDate getIssuedDate() { return issuedDate; } public void setIssuedDate(LocalDate v) { this.issuedDate = v; }
    public String getCredentialUrl() { return credentialUrl; } public void setCredentialUrl(String v) { this.credentialUrl = v; }
    public Boolean getVerified() { return verified; } public void setVerified(Boolean v) { this.verified = v; }
    public UUID getVerifiedBy() { return verifiedBy; } public void setVerifiedBy(UUID v) { this.verifiedBy = v; }
    public String getMetadata() { return metadata; } public void setMetadata(String v) { this.metadata = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
