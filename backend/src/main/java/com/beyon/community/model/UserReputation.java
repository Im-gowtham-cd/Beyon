package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_reputation")
public class UserReputation {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "user_id", nullable = false, unique = true) private UUID userId;
    @Column(name = "total_reputation", nullable = false) private Integer totalReputation = 0;
    @Column(name = "answers_count", nullable = false) private Integer answersCount = 0;
    @Column(name = "accepted_answers", nullable = false) private Integer acceptedAnswers = 0;
    @Column(name = "upvotes_received", nullable = false) private Integer upvotesReceived = 0;
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public UserReputation() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getUserId() { return userId; } public void setUserId(UUID v) { this.userId = v; }
    public Integer getTotalReputation() { return totalReputation; } public void setTotalReputation(Integer v) { this.totalReputation = v; }
    public Integer getAnswersCount() { return answersCount; } public void setAnswersCount(Integer v) { this.answersCount = v; }
    public Integer getAcceptedAnswers() { return acceptedAnswers; } public void setAcceptedAnswers(Integer v) { this.acceptedAnswers = v; }
    public Integer getUpvotesReceived() { return upvotesReceived; } public void setUpvotesReceived(Integer v) { this.upvotesReceived = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
