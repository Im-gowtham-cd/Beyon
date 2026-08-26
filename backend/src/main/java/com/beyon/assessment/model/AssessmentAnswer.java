package com.beyon.assessment.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "assessment_answers")
public class AssessmentAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "selected_option_id")
    private UUID selectedOptionId;

    @Column(name = "answer_text")
    private String answerText;

    @Column(name = "code_answer")
    private String codeAnswer;

    @Column(name = "time_spent_seconds")
    private Integer timeSpentSeconds = 0;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "marks_awarded", precision = 8, scale = 2)
    private java.math.BigDecimal marksAwarded = java.math.BigDecimal.ZERO;

    @Column(name = "marked_for_review", nullable = false)
    private Boolean markedForReview = false;

    @Column(name = "answered_at")
    private OffsetDateTime answeredAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public AssessmentAnswer() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }
    public UUID getQuestionId() { return questionId; }
    public void setQuestionId(UUID questionId) { this.questionId = questionId; }
    public UUID getSelectedOptionId() { return selectedOptionId; }
    public void setSelectedOptionId(UUID v) { this.selectedOptionId = v; }
    public String getAnswerText() { return answerText; }
    public void setAnswerText(String v) { this.answerText = v; }
    public String getCodeAnswer() { return codeAnswer; }
    public void setCodeAnswer(String v) { this.codeAnswer = v; }
    public Integer getTimeSpentSeconds() { return timeSpentSeconds; }
    public void setTimeSpentSeconds(Integer v) { this.timeSpentSeconds = v; }
    public Boolean getIsCorrect() { return isCorrect; }
    public void setIsCorrect(Boolean v) { this.isCorrect = v; }
    public java.math.BigDecimal getMarksAwarded() { return marksAwarded; }
    public void setMarksAwarded(java.math.BigDecimal v) { this.marksAwarded = v; }
    public Boolean getMarkedForReview() { return markedForReview; }
    public void setMarkedForReview(Boolean v) { this.markedForReview = v; }
    public OffsetDateTime getAnsweredAt() { return answeredAt; }
    public void setAnsweredAt(OffsetDateTime v) { this.answeredAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
