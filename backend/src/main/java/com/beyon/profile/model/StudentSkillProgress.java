package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_skill_progress")
public class StudentSkillProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private UUID studentId;

    @Column(nullable = false)
    private UUID skillId;

    @Column(columnDefinition = "uuid")
    private UUID topicId;

    @Column(columnDefinition = "uuid")
    private UUID subtopicId;

    @Column(nullable = false)
    private int progressPercentage = 0;

    @Column(nullable = false, length = 20)
    private String learningStage = "NOT_STARTED";

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public UUID getSkillId() { return skillId; }
    public void setSkillId(UUID skillId) { this.skillId = skillId; }
    public UUID getTopicId() { return topicId; }
    public void setTopicId(UUID topicId) { this.topicId = topicId; }
    public UUID getSubtopicId() { return subtopicId; }
    public void setSubtopicId(UUID subtopicId) { this.subtopicId = subtopicId; }
    public int getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(int progressPercentage) { this.progressPercentage = progressPercentage; }
    public String getLearningStage() { return learningStage; }
    public void setLearningStage(String learningStage) { this.learningStage = learningStage; }
    public Instant getUpdatedAt() { return updatedAt; }
}
