package com.beyon.institution.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "institution_otps")
public class InstitutionOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "varchar(36)")
    private UUID id;

    @Column(name = "institution_id", columnDefinition = "varchar(36)")
    private UUID institutionId;

    @Column(name = "aicte_id", nullable = false, length = 50)
    private String aicteId;

    @Column(name = "principal_email", nullable = false, length = 255)
    private String principalEmail;

    @Column(name = "principal_mobile", length = 20)
    private String principalMobile;

    @Column(name = "principal_name", length = 100)
    private String principalName;

    @Column(name = "otp_code", nullable = false, length = 10)
    private String otpCode;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean consumed = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public InstitutionOtp() {}

    public InstitutionOtp(UUID institutionId, String aicteId, String principalEmail, String principalMobile, String principalName, String otpCode, Instant expiresAt) {
        this.institutionId = institutionId;
        this.aicteId = aicteId;
        this.principalEmail = principalEmail;
        this.principalMobile = principalMobile;
        this.principalName = principalName;
        this.otpCode = otpCode;
        this.expiresAt = expiresAt;
        this.consumed = false;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getInstitutionId() { return institutionId; }
    public void setInstitutionId(UUID institutionId) { this.institutionId = institutionId; }
    public String getAicteId() { return aicteId; }
    public void setAicteId(String aicteId) { this.aicteId = aicteId; }
    public String getPrincipalEmail() { return principalEmail; }
    public void setPrincipalEmail(String principalEmail) { this.principalEmail = principalEmail; }
    public String getPrincipalMobile() { return principalMobile; }
    public void setPrincipalMobile(String principalMobile) { this.principalMobile = principalMobile; }
    public String getPrincipalName() { return principalName; }
    public void setPrincipalName(String principalName) { this.principalName = principalName; }
    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public boolean isConsumed() { return consumed; }
    public void setConsumed(boolean consumed) { this.consumed = consumed; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
