package com.beyon.practice.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "opportunity_applications", uniqueConstraints = @UniqueConstraint(columnNames = {"opportunity_id", "student_id"}))
public class OpportunityApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "varchar(36)")
    private UUID id;

    @Column(nullable = false)
    private UUID opportunityId;

    @Column(nullable = false)
    private UUID studentId;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(nullable = false)
    private int coinsSpent = 0;

    @Column(precision = 8, scale = 2)
    private BigDecimal assessmentScore;

    private Instant appliedAt;

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getOpportunityId() { return opportunityId; }
    public void setOpportunityId(UUID opportunityId) { this.opportunityId = opportunityId; }
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getCoinsSpent() { return coinsSpent; }
    public void setCoinsSpent(int coinsSpent) { this.coinsSpent = coinsSpent; }
    public BigDecimal getAssessmentScore() { return assessmentScore; }
    public void setAssessmentScore(BigDecimal assessmentScore) { this.assessmentScore = assessmentScore; }
    public Instant getAppliedAt() { return appliedAt; }
    public void setAppliedAt(Instant appliedAt) { this.appliedAt = appliedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
