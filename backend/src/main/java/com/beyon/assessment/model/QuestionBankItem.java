package com.beyon.assessment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "question_bank")
public class QuestionBankItem {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "creator_id", nullable = false) private UUID creatorId;
    @Column(name = "creator_role", nullable = false, length = 30) private String creatorRole;
    @Column(name = "topic_id") private UUID topicId;
    @Column(name = "skill_id") private UUID skillId;
    @Column(name = "question_type", nullable = false, length = 30) private String questionType;
    @Column(nullable = false, length = 20) private String difficulty = "MEDIUM";
    @Column(name = "question_text", columnDefinition = "text", nullable = false) private String questionText;
    @Column(columnDefinition = "jsonb") private String options;
    @Column(name = "correct_answer", columnDefinition = "text") private String correctAnswer;
    @Column(columnDefinition = "text") private String explanation;
    @Column(name = "expected_time_seconds") private Integer expectedTimeSeconds = 60;
    @Column(nullable = false, precision = 5, scale = 2) private BigDecimal score = BigDecimal.ONE;
    @Column(columnDefinition = "jsonb") private String tags = "[]";
    @Column(name = "is_active", nullable = false) private Boolean isActive = true;
    @Column(nullable = false) private Integer version = 1;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public QuestionBankItem() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getCreatorId() { return creatorId; } public void setCreatorId(UUID v) { this.creatorId = v; }
    public String getCreatorRole() { return creatorRole; } public void setCreatorRole(String v) { this.creatorRole = v; }
    public UUID getTopicId() { return topicId; } public void setTopicId(UUID v) { this.topicId = v; }
    public UUID getSkillId() { return skillId; } public void setSkillId(UUID v) { this.skillId = v; }
    public String getQuestionType() { return questionType; } public void setQuestionType(String v) { this.questionType = v; }
    public String getDifficulty() { return difficulty; } public void setDifficulty(String v) { this.difficulty = v; }
    public String getQuestionText() { return questionText; } public void setQuestionText(String v) { this.questionText = v; }
    public String getOptions() { return options; } public void setOptions(String v) { this.options = v; }
    public String getCorrectAnswer() { return correctAnswer; } public void setCorrectAnswer(String v) { this.correctAnswer = v; }
    public String getExplanation() { return explanation; } public void setExplanation(String v) { this.explanation = v; }
    public Integer getExpectedTimeSeconds() { return expectedTimeSeconds; } public void setExpectedTimeSeconds(Integer v) { this.expectedTimeSeconds = v; }
    public BigDecimal getScore() { return score; } public void setScore(BigDecimal v) { this.score = v; }
    public String getTags() { return tags; } public void setTags(String v) { this.tags = v; }
    public Boolean getIsActive() { return isActive; } public void setIsActive(Boolean v) { this.isActive = v; }
    public Integer getVersion() { return version; } public void setVersion(Integer v) { this.version = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
