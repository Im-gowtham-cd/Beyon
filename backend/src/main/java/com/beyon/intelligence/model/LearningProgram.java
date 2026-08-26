package com.beyon.intelligence.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "learning_programs")
public class LearningProgram {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, length = 200) private String title;
    @Column(columnDefinition = "text") private String description;
    @Column(name = "program_type", nullable = false, length = 30) private String programType;
    @Column(length = 200) private String provider;
    @Column(name = "skill_id") private UUID skillId;
    @Column(name = "topic_id") private UUID topicId;
    @Column(length = 10) private String difficulty;
    @Column(name = "duration_hours") private Integer durationHours;
    private BigDecimal cost;
    @Column(length = 10) private String currency = "INR";
    @Column(length = 500) private String url;
    @Column(name = "is_free", nullable = false) private Boolean isFree = true;
    private BigDecimal rating;
    @Column(name = "enrolled_count") private Integer enrolledCount = 0;
    @Column(name = "is_active", nullable = false) private Boolean isActive = true;
    @Column(name = "created_at") private OffsetDateTime createdAt;

    @PrePersist void onCreate() { createdAt = OffsetDateTime.now(); }

    public LearningProgram() {}

    public UUID getId() { return id; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public String getProgramType() { return programType; } public void setProgramType(String v) { this.programType = v; }
    public String getProvider() { return provider; } public void setProvider(String v) { this.provider = v; }
    public UUID getSkillId() { return skillId; } public void setSkillId(UUID v) { this.skillId = v; }
    public UUID getTopicId() { return topicId; } public void setTopicId(UUID v) { this.topicId = v; }
    public String getDifficulty() { return difficulty; } public void setDifficulty(String v) { this.difficulty = v; }
    public Integer getDurationHours() { return durationHours; } public void setDurationHours(Integer v) { this.durationHours = v; }
    public BigDecimal getCost() { return cost; } public void setCost(BigDecimal v) { this.cost = v; }
    public String getCurrency() { return currency; } public void setCurrency(String v) { this.currency = v; }
    public String getUrl() { return url; } public void setUrl(String v) { this.url = v; }
    public Boolean getIsFree() { return isFree; } public void setIsFree(Boolean v) { this.isFree = v; }
    public BigDecimal getRating() { return rating; } public void setRating(BigDecimal v) { this.rating = v; }
    public Integer getEnrolledCount() { return enrolledCount; } public void setEnrolledCount(Integer v) { this.enrolledCount = v; }
    public Boolean getIsActive() { return isActive; } public void setIsActive(Boolean v) { this.isActive = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
