package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "interview_feedback_intelligence")
public class InterviewFeedbackIntelligence {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "interview_id", nullable = false) private UUID interviewId;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "interviewer_id", nullable = false) private UUID interviewerId;
    @Column(name = "technical_knowledge") private Integer technicalKnowledge = 0;
    @Column(name = "problem_solving") private Integer problemSolving = 0;
    @Column(name = "communication") private Integer communication = 0;
    @Column(name = "teamwork") private Integer teamwork = 0;
    @Column(name = "leadership") private Integer leadership = 0;
    @Column(name = "domain_knowledge") private Integer domainKnowledge = 0;
    @Column(name = "confidence") private Integer confidence = 0;
    @Column(name = "overall_rating") private Integer overallRating = 0;
    @Column(columnDefinition = "text") private String strengths;
    @Column(columnDefinition = "text") private String weaknesses;
    @Column(columnDefinition = "text") private String feedback;
    @Column(name = "recommended_improvements", columnDefinition = "text") private String recommendedImprovements;
    @Column(name = "is_candidate_visible", nullable = false) private Boolean isCandidateVisible = false;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public InterviewFeedbackIntelligence() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getInterviewId() { return interviewId; } public void setInterviewId(UUID v) { this.interviewId = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getInterviewerId() { return interviewerId; } public void setInterviewerId(UUID v) { this.interviewerId = v; }
    public Integer getTechnicalKnowledge() { return technicalKnowledge; } public void setTechnicalKnowledge(Integer v) { this.technicalKnowledge = v; }
    public Integer getProblemSolving() { return problemSolving; } public void setProblemSolving(Integer v) { this.problemSolving = v; }
    public Integer getCommunication() { return communication; } public void setCommunication(Integer v) { this.communication = v; }
    public Integer getTeamwork() { return teamwork; } public void setTeamwork(Integer v) { this.teamwork = v; }
    public Integer getLeadership() { return leadership; } public void setLeadership(Integer v) { this.leadership = v; }
    public Integer getDomainKnowledge() { return domainKnowledge; } public void setDomainKnowledge(Integer v) { this.domainKnowledge = v; }
    public Integer getConfidence() { return confidence; } public void setConfidence(Integer v) { this.confidence = v; }
    public Integer getOverallRating() { return overallRating; } public void setOverallRating(Integer v) { this.overallRating = v; }
    public String getStrengths() { return strengths; } public void setStrengths(String v) { this.strengths = v; }
    public String getWeaknesses() { return weaknesses; } public void setWeaknesses(String v) { this.weaknesses = v; }
    public String getFeedback() { return feedback; } public void setFeedback(String v) { this.feedback = v; }
    public String getRecommendedImprovements() { return recommendedImprovements; } public void setRecommendedImprovements(String v) { this.recommendedImprovements = v; }
    public Boolean getIsCandidateVisible() { return isCandidateVisible; } public void setIsCandidateVisible(Boolean v) { this.isCandidateVisible = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
