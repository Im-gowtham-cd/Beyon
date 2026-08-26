package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "learning_program_module_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"enrollment_id", "module_id"})
})
public class LearningProgramModuleProgress {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "enrollment_id", nullable = false) private UUID enrollmentId;
    @Column(name = "module_id", nullable = false) private UUID moduleId;
    @Column(nullable = false, length = 20) private String status = "NOT_STARTED";
    @Column(name = "completed_at") private OffsetDateTime completedAt;

    public LearningProgramModuleProgress() {}

    public UUID getId() { return id; }
    public UUID getEnrollmentId() { return enrollmentId; } public void setEnrollmentId(UUID v) { this.enrollmentId = v; }
    public UUID getModuleId() { return moduleId; } public void setModuleId(UUID v) { this.moduleId = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public OffsetDateTime getCompletedAt() { return completedAt; } public void setCompletedAt(OffsetDateTime v) { this.completedAt = v; }
}
