package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "learning_program_enrollments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "program_id"})
})
public class LearningProgramEnrollment {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "program_id", nullable = false) private UUID programId;
    @Column(name = "progress_percent", nullable = false) private Integer progressPercent = 0;
    @Column(name = "modules_completed", nullable = false) private Integer modulesCompleted = 0;
    @Column(nullable = false, length = 20) private String status = "ENROLLED";
    @Column(name = "enrolled_at") private OffsetDateTime enrolledAt;
    @Column(name = "completed_at") private OffsetDateTime completedAt;

    @PrePersist void onCreate() { enrolledAt = OffsetDateTime.now(); }

    public LearningProgramEnrollment() {}

    public UUID getId() { return id; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getProgramId() { return programId; } public void setProgramId(UUID v) { this.programId = v; }
    public Integer getProgressPercent() { return progressPercent; } public void setProgressPercent(Integer v) { this.progressPercent = v; }
    public Integer getModulesCompleted() { return modulesCompleted; } public void setModulesCompleted(Integer v) { this.modulesCompleted = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public OffsetDateTime getEnrolledAt() { return enrolledAt; }
    public OffsetDateTime getCompletedAt() { return completedAt; } public void setCompletedAt(OffsetDateTime v) { this.completedAt = v; }
}
