package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_learning_topics", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "topic_id"}))
public class StudentLearningTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "varchar(36)")
    private UUID id;

    @Column(nullable = false)
    private UUID studentId;

    @Column(nullable = false)
    private UUID topicId;

    @Column(columnDefinition = "varchar(36)")
    private UUID subtopicId;

    @Column(nullable = false, length = 20)
    private String status = "LEARNING";

    @Column(nullable = false, updatable = false)
    private Instant startedAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public UUID getTopicId() { return topicId; }
    public void setTopicId(UUID topicId) { this.topicId = topicId; }
    public UUID getSubtopicId() { return subtopicId; }
    public void setSubtopicId(UUID subtopicId) { this.subtopicId = subtopicId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
