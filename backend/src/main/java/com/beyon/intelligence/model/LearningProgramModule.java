package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "learning_program_modules")
public class LearningProgramModule {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "program_id", nullable = false) private UUID programId;
    @Column(nullable = false, length = 200) private String title;
    @Column(columnDefinition = "text") private String description;
    @Column(name = "sort_order", nullable = false) private Integer sortOrder = 0;
    @Column(name = "module_type", nullable = false, length = 50) private String moduleType;
    @Column(name = "duration_minutes") private Integer durationMinutes;
    @Column(name = "created_at") private OffsetDateTime createdAt;

    @PrePersist void onCreate() { createdAt = OffsetDateTime.now(); }

    public LearningProgramModule() {}

    public UUID getId() { return id; }
    public UUID getProgramId() { return programId; } public void setProgramId(UUID v) { this.programId = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public Integer getSortOrder() { return sortOrder; } public void setSortOrder(Integer v) { this.sortOrder = v; }
    public String getModuleType() { return moduleType; } public void setModuleType(String v) { this.moduleType = v; }
    public Integer getDurationMinutes() { return durationMinutes; } public void setDurationMinutes(Integer v) { this.durationMinutes = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
