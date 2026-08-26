package com.beyon.assessment.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "assessment_sessions")
public class AssessmentSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "application_id", nullable = false, unique = true)
    private UUID applicationId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "opportunity_id", nullable = false)
    private UUID opportunityId;

    @Column(name = "policy_id")
    private UUID policyId;

    @Column(name = "session_token", nullable = false, unique = true, length = 256)
    private String sessionToken;

    @Column(name = "launch_token", length = 256)
    private String launchToken;

    @Column(name = "launch_token_used", nullable = false)
    private Boolean launchTokenUsed = false;

    @Column(nullable = false, length = 30)
    private String status = "CREATED";

    @Column(name = "device_fingerprint", length = 512)
    private String deviceFingerprint;

    @Column(name = "device_info", columnDefinition = "jsonb")
    private String deviceInfo;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions = 0;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 60;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    @Column(name = "last_heartbeat_at")
    private OffsetDateTime lastHeartbeatAt;

    @Column(name = "last_autosave_at")
    private OffsetDateTime lastAutosaveAt;

    @Column(name = "connection_lost_count", nullable = false)
    private Integer connectionLostCount = 0;

    @Column(name = "fullscreen_exit_count", nullable = false)
    private Integer fullscreenExitCount = 0;

    @Column(name = "window_focus_lost_count", nullable = false)
    private Integer windowFocusLostCount = 0;

    @Column(name = "warning_count", nullable = false)
    private Integer warningCount = 0;

    @Column(name = "critical_event_count", nullable = false)
    private Integer criticalEventCount = 0;

    @Column(precision = 8, scale = 2)
    private java.math.BigDecimal score;

    @Column(precision = 5, scale = 2)
    private java.math.BigDecimal accuracy;

    @Column(name = "questions_attempted")
    private Integer questionsAttempted = 0;

    @Column(name = "questions_correct")
    private Integer questionsCorrect = 0;

    @Column(name = "time_used_seconds")
    private Integer timeUsedSeconds = 0;

    @Column(name = "skill_performance", columnDefinition = "jsonb")
    private String skillPerformance;

    @Column(name = "topic_performance", columnDefinition = "jsonb")
    private String topicPerformance;

    @Column(name = "proctoring_summary", columnDefinition = "jsonb")
    private String proctoringSummary;

    @Column(name = "integrity_status", length = 30)
    private String integrityStatus = "CLEAN";

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public AssessmentSession() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getApplicationId() { return applicationId; }
    public void setApplicationId(UUID applicationId) { this.applicationId = applicationId; }
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public UUID getOpportunityId() { return opportunityId; }
    public void setOpportunityId(UUID opportunityId) { this.opportunityId = opportunityId; }
    public UUID getPolicyId() { return policyId; }
    public void setPolicyId(UUID policyId) { this.policyId = policyId; }
    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }
    public String getLaunchToken() { return launchToken; }
    public void setLaunchToken(String launchToken) { this.launchToken = launchToken; }
    public Boolean getLaunchTokenUsed() { return launchTokenUsed; }
    public void setLaunchTokenUsed(Boolean v) { this.launchTokenUsed = v; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDeviceFingerprint() { return deviceFingerprint; }
    public void setDeviceFingerprint(String v) { this.deviceFingerprint = v; }
    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String v) { this.deviceInfo = v; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String v) { this.ipAddress = v; }
    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer v) { this.totalQuestions = v; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer v) { this.durationMinutes = v; }
    public OffsetDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(OffsetDateTime v) { this.startedAt = v; }
    public OffsetDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(OffsetDateTime v) { this.submittedAt = v; }
    public OffsetDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(OffsetDateTime v) { this.completedAt = v; }
    public OffsetDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(OffsetDateTime v) { this.expiresAt = v; }
    public OffsetDateTime getLastHeartbeatAt() { return lastHeartbeatAt; }
    public void setLastHeartbeatAt(OffsetDateTime v) { this.lastHeartbeatAt = v; }
    public OffsetDateTime getLastAutosaveAt() { return lastAutosaveAt; }
    public void setLastAutosaveAt(OffsetDateTime v) { this.lastAutosaveAt = v; }
    public Integer getConnectionLostCount() { return connectionLostCount; }
    public void setConnectionLostCount(Integer v) { this.connectionLostCount = v; }
    public Integer getFullscreenExitCount() { return fullscreenExitCount; }
    public void setFullscreenExitCount(Integer v) { this.fullscreenExitCount = v; }
    public Integer getWindowFocusLostCount() { return windowFocusLostCount; }
    public void setWindowFocusLostCount(Integer v) { this.windowFocusLostCount = v; }
    public Integer getWarningCount() { return warningCount; }
    public void setWarningCount(Integer v) { this.warningCount = v; }
    public Integer getCriticalEventCount() { return criticalEventCount; }
    public void setCriticalEventCount(Integer v) { this.criticalEventCount = v; }
    public java.math.BigDecimal getScore() { return score; }
    public void setScore(java.math.BigDecimal v) { this.score = v; }
    public java.math.BigDecimal getAccuracy() { return accuracy; }
    public void setAccuracy(java.math.BigDecimal v) { this.accuracy = v; }
    public Integer getQuestionsAttempted() { return questionsAttempted; }
    public void setQuestionsAttempted(Integer v) { this.questionsAttempted = v; }
    public Integer getQuestionsCorrect() { return questionsCorrect; }
    public void setQuestionsCorrect(Integer v) { this.questionsCorrect = v; }
    public Integer getTimeUsedSeconds() { return timeUsedSeconds; }
    public void setTimeUsedSeconds(Integer v) { this.timeUsedSeconds = v; }
    public String getSkillPerformance() { return skillPerformance; }
    public void setSkillPerformance(String v) { this.skillPerformance = v; }
    public String getTopicPerformance() { return topicPerformance; }
    public void setTopicPerformance(String v) { this.topicPerformance = v; }
    public String getProctoringSummary() { return proctoringSummary; }
    public void setProctoringSummary(String v) { this.proctoringSummary = v; }
    public String getIntegrityStatus() { return integrityStatus; }
    public void setIntegrityStatus(String v) { this.integrityStatus = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
