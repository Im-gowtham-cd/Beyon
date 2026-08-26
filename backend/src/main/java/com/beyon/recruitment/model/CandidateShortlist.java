package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "candidate_shortlists")
public class CandidateShortlist {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "drive_id", nullable = false) private UUID driveId;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "pipeline_id") private UUID pipelineId;
    @Column(name = "overall_score", precision = 5, scale = 2) private BigDecimal overallScore;
    @Column(name = "assessment_score", precision = 5, scale = 2) private BigDecimal assessmentScore;
    @Column(name = "skill_match_score", precision = 5, scale = 2) private BigDecimal skillMatchScore;
    @Column(name = "rank_in_drive") private Integer rankInDrive;
    @Column(nullable = false, length = 30) private String status = "SHORTLISTED";
    @Column(name = "shortlisted_by") private UUID shortlistedBy;
    @Column(name = "shortlisted_at", nullable = false) private OffsetDateTime shortlistedAt = OffsetDateTime.now();
    @Column(columnDefinition = "text") private String notes;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public CandidateShortlist() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getDriveId() { return driveId; } public void setDriveId(UUID v) { this.driveId = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getPipelineId() { return pipelineId; } public void setPipelineId(UUID v) { this.pipelineId = v; }
    public BigDecimal getOverallScore() { return overallScore; } public void setOverallScore(BigDecimal v) { this.overallScore = v; }
    public BigDecimal getAssessmentScore() { return assessmentScore; } public void setAssessmentScore(BigDecimal v) { this.assessmentScore = v; }
    public BigDecimal getSkillMatchScore() { return skillMatchScore; } public void setSkillMatchScore(BigDecimal v) { this.skillMatchScore = v; }
    public Integer getRankInDrive() { return rankInDrive; } public void setRankInDrive(Integer v) { this.rankInDrive = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public UUID getShortlistedBy() { return shortlistedBy; } public void setShortlistedBy(UUID v) { this.shortlistedBy = v; }
    public OffsetDateTime getShortlistedAt() { return shortlistedAt; } public void setShortlistedAt(OffsetDateTime v) { this.shortlistedAt = v; }
    public String getNotes() { return notes; } public void setNotes(String v) { this.notes = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
