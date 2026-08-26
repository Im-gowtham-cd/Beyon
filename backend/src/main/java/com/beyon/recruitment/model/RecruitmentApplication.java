package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recruitment_applications", uniqueConstraints = @UniqueConstraint(columnNames = {"opportunity_id", "student_id"}))
public class RecruitmentApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private UUID studentId;

    @Column(nullable = false)
    private UUID opportunityId;

    @Column(columnDefinition = "uuid")
    private UUID driveId;

    @Column(columnDefinition = "uuid")
    private UUID institutionId;

    @Column(nullable = false, length = 30)
    private String status = "ELIGIBLE";

    @Column(precision = 8, scale = 2)
    private BigDecimal assessmentScore;

    @Column(precision = 8, scale = 2)
    private BigDecimal interviewScore;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private int coinsSpent = 0;

    private Instant appliedAt;

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public UUID getOpportunityId() { return opportunityId; }
    public void setOpportunityId(UUID opportunityId) { this.opportunityId = opportunityId; }
    public UUID getDriveId() { return driveId; }
    public void setDriveId(UUID driveId) { this.driveId = driveId; }
    public UUID getInstitutionId() { return institutionId; }
    public void setInstitutionId(UUID institutionId) { this.institutionId = institutionId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getAssessmentScore() { return assessmentScore; }
    public void setAssessmentScore(BigDecimal assessmentScore) { this.assessmentScore = assessmentScore; }
    public BigDecimal getInterviewScore() { return interviewScore; }
    public void setInterviewScore(BigDecimal interviewScore) { this.interviewScore = interviewScore; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public int getCoinsSpent() { return coinsSpent; }
    public void setCoinsSpent(int coinsSpent) { this.coinsSpent = coinsSpent; }
    public Instant getAppliedAt() { return appliedAt; }
    public void setAppliedAt(Instant appliedAt) { this.appliedAt = appliedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Instant getCreatedAt() { return createdAt; }
}
