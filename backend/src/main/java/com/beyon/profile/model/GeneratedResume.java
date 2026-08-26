package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "generated_resumes")
public class GeneratedResume {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "template_id") private UUID templateId;
    @Column(length = 300) private String title;
    @Column(nullable = false, columnDefinition = "jsonb") private String sections = "[]";
    @Column(name = "file_url", length = 500) private String fileUrl;
    @Column(name = "generation_status", nullable = false, length = 30) private String generationStatus = "DRAFT";
    @Column(columnDefinition = "jsonb") private String aiSuggestions;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public GeneratedResume() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getTemplateId() { return templateId; } public void setTemplateId(UUID v) { this.templateId = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getSections() { return sections; } public void setSections(String v) { this.sections = v; }
    public String getFileUrl() { return fileUrl; } public void setFileUrl(String v) { this.fileUrl = v; }
    public String getGenerationStatus() { return generationStatus; } public void setGenerationStatus(String v) { this.generationStatus = v; }
    public String getAiSuggestions() { return aiSuggestions; } public void setAiSuggestions(String v) { this.aiSuggestions = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
