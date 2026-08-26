package com.beyon.community.model;

import com.beyon.identity.model.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "challenge_participations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"challenge_id", "student_id"})
})
public class ChallengeParticipation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private IndustryChallenge challenge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "team_name", length = 255)
    private String teamName;

    @Column(name = "team_members", columnDefinition = "TEXT")
    private String teamMembers;

    @Column(name = "submission_url", length = 500)
    private String submissionUrl;

    @Column(name = "submission_docs", columnDefinition = "TEXT")
    private String submissionDocs;

    @Column(name = "submission_demo", length = 500)
    private String submissionDemo;

    @Column(name = "submission_presentation", length = 500)
    private String submissionPresentation;

    @Column(name = "technical_score")
    private Integer technicalScore;

    @Column(name = "innovation_score")
    private Integer innovationScore;

    @Column(name = "problem_solving_score")
    private Integer problemSolvingScore;

    @Column(name = "design_score")
    private Integer designScore;

    @Column(name = "documentation_score")
    private Integer documentationScore;

    @Column(name = "total_score")
    private Integer totalScore;

    @Column(name = "rank_position")
    private Integer rankPosition;

    @Column(length = 50)
    private String status = "PARTICIPATING";

    @Column(name = "registered_at", nullable = false)
    private Instant registeredAt = Instant.now();

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "evaluated_at")
    private Instant evaluatedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public IndustryChallenge getChallenge() { return challenge; }
    public void setChallenge(IndustryChallenge challenge) { this.challenge = challenge; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public String getTeamMembers() { return teamMembers; }
    public void setTeamMembers(String teamMembers) { this.teamMembers = teamMembers; }
    public String getSubmissionUrl() { return submissionUrl; }
    public void setSubmissionUrl(String submissionUrl) { this.submissionUrl = submissionUrl; }
    public String getSubmissionDocs() { return submissionDocs; }
    public void setSubmissionDocs(String submissionDocs) { this.submissionDocs = submissionDocs; }
    public String getSubmissionDemo() { return submissionDemo; }
    public void setSubmissionDemo(String submissionDemo) { this.submissionDemo = submissionDemo; }
    public String getSubmissionPresentation() { return submissionPresentation; }
    public void setSubmissionPresentation(String submissionPresentation) { this.submissionPresentation = submissionPresentation; }
    public Integer getTechnicalScore() { return technicalScore; }
    public void setTechnicalScore(Integer technicalScore) { this.technicalScore = technicalScore; }
    public Integer getInnovationScore() { return innovationScore; }
    public void setInnovationScore(Integer innovationScore) { this.innovationScore = innovationScore; }
    public Integer getProblemSolvingScore() { return problemSolvingScore; }
    public void setProblemSolvingScore(Integer problemSolvingScore) { this.problemSolvingScore = problemSolvingScore; }
    public Integer getDesignScore() { return designScore; }
    public void setDesignScore(Integer designScore) { this.designScore = designScore; }
    public Integer getDocumentationScore() { return documentationScore; }
    public void setDocumentationScore(Integer documentationScore) { this.documentationScore = documentationScore; }
    public Integer getTotalScore() { return totalScore; }
    public void setTotalScore(Integer totalScore) { this.totalScore = totalScore; }
    public Integer getRankPosition() { return rankPosition; }
    public void setRankPosition(Integer rankPosition) { this.rankPosition = rankPosition; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(Instant registeredAt) { this.registeredAt = registeredAt; }
    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
    public Instant getEvaluatedAt() { return evaluatedAt; }
    public void setEvaluatedAt(Instant evaluatedAt) { this.evaluatedAt = evaluatedAt; }
}
