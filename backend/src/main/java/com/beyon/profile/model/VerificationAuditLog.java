package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "verification_audit_logs")
public class VerificationAuditLog {

    @Id
    @Column(columnDefinition = "varchar(36)")
    private String id;

    @Column(columnDefinition = "varchar(36)")
    private String companyId;

    @Column(columnDefinition = "varchar(36)")
    private String userId;

    @Column(columnDefinition = "varchar(36)")
    private String verificationId;

    @Column(nullable = false, length = 100)
    private String action; // REGISTRATION_SUBMITTED, AUTO_VERIFIED, SENT_TO_MANUAL_REVIEW, ADMIN_APPROVED, ADMIN_REJECTED, DOCUMENTS_REQUESTED, ACCOUNT_SUSPENDED, NOTES_ADDED

    @Column(nullable = false, length = 50)
    private String result; // PASS, FAIL, MANUAL_REVIEW, VERIFIED, REJECTED, SUSPENDED

    @Column(columnDefinition = "varchar(36)")
    private String actorId;

    @Column(length = 50)
    private String actorRole; // SYSTEM, SUPER_ADMIN

    @Column(columnDefinition = "TEXT")
    private String failureReason;

    @Column(columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(columnDefinition = "TEXT")
    private String checksSummary;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public VerificationAuditLog() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getVerificationId() { return verificationId; }
    public void setVerificationId(String verificationId) { this.verificationId = verificationId; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
    public String getActorId() { return actorId; }
    public void setActorId(String actorId) { this.actorId = actorId; }
    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }
    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
    public String getChecksSummary() { return checksSummary; }
    public void setChecksSummary(String checksSummary) { this.checksSummary = checksSummary; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
