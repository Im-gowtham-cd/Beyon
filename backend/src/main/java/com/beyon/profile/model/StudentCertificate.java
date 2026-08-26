package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_certificates", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"certificate_id"})
})
public class StudentCertificate {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "program_id", nullable = false) private UUID programId;
    @Column(name = "certificate_id", nullable = false, length = 30) private String certificateId;
    @Column(name = "student_name", nullable = false, length = 200) private String studentName;
    @Column(name = "program_name", nullable = false, length = 200) private String programName;
    @Column(name = "issuer_name", length = 200) private String issuerName;
    @Column(name = "skills_covered") private String skillsCovered;
    private Integer score;
    @Column(name = "issue_date", nullable = false) private LocalDate issueDate;
    @Column(name = "verification_url", length = 500) private String verificationUrl;
    @Column(name = "created_at") private OffsetDateTime createdAt;

    @PrePersist void onCreate() { createdAt = OffsetDateTime.now(); if (issueDate == null) issueDate = LocalDate.now(); }

    public StudentCertificate() {}

    public UUID getId() { return id; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getProgramId() { return programId; } public void setProgramId(UUID v) { this.programId = v; }
    public String getCertificateId() { return certificateId; } public void setCertificateId(String v) { this.certificateId = v; }
    public String getStudentName() { return studentName; } public void setStudentName(String v) { this.studentName = v; }
    public String getProgramName() { return programName; } public void setProgramName(String v) { this.programName = v; }
    public String getIssuerName() { return issuerName; } public void setIssuerName(String v) { this.issuerName = v; }
    public String getSkillsCovered() { return skillsCovered; } public void setSkillsCovered(String v) { this.skillsCovered = v; }
    public Integer getScore() { return score; } public void setScore(Integer v) { this.score = v; }
    public LocalDate getIssueDate() { return issueDate; } public void setIssueDate(LocalDate v) { this.issueDate = v; }
    public String getVerificationUrl() { return verificationUrl; } public void setVerificationUrl(String v) { this.verificationUrl = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
