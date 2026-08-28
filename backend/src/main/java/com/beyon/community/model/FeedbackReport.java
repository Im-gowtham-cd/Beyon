package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "feedback_reports")
public class FeedbackReport {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "report_number", insertable = false, updatable = false) private Integer reportNumber;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "user_role", nullable = false, length = 30) private String userRole;
    @Column(name = "report_type", nullable = false, length = 30) private String reportType;
    @Column(nullable = false, length = 50) private String category;
    @Column(nullable = false, length = 300) private String title;
    @Column(columnDefinition = "text", nullable = false) private String description;
    @Column(name = "user_priority", nullable = false, length = 20) private String userPriority = "NORMAL";
    @Column(name = "system_severity", nullable = false, length = 10) private String systemSeverity = "S2";
    @Column(nullable = false, length = 30) private String status = "SUBMITTED";
    @Column(name = "assigned_to") private UUID assignedTo;
    @Column(name = "application_version", length = 20) private String applicationVersion;
    @Column(length = 500) private String page;
    @Column(name = "browser_info", length = 200) private String browserInfo;
    @Column(name = "os_info", length = 200) private String osInfo;
    @Column(name = "screen_size", length = 30) private String screenSize;
    @Column(name = "request_id", length = 100) private String requestId;
    @Column(name = "desktop_app_version", length = 20) private String desktopAppVersion;
    @Column(name = "assessment_session_id") private UUID assessmentSessionId;
    @Column(columnDefinition = "text") private String metadata;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();
    @Column(name = "resolved_at") private OffsetDateTime resolvedAt;

    public FeedbackReport() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public Integer getReportNumber() { return reportNumber; }
    public UUID getUserId() { return userId; } public void setUserId(UUID v) { this.userId = v; }
    public String getUserRole() { return userRole; } public void setUserRole(String v) { this.userRole = v; }
    public String getReportType() { return reportType; } public void setReportType(String v) { this.reportType = v; }
    public String getCategory() { return category; } public void setCategory(String v) { this.category = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public String getUserPriority() { return userPriority; } public void setUserPriority(String v) { this.userPriority = v; }
    public String getSystemSeverity() { return systemSeverity; } public void setSystemSeverity(String v) { this.systemSeverity = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public UUID getAssignedTo() { return assignedTo; } public void setAssignedTo(UUID v) { this.assignedTo = v; }
    public String getApplicationVersion() { return applicationVersion; } public void setApplicationVersion(String v) { this.applicationVersion = v; }
    public String getPage() { return page; } public void setPage(String v) { this.page = v; }
    public String getBrowserInfo() { return browserInfo; } public void setBrowserInfo(String v) { this.browserInfo = v; }
    public String getOsInfo() { return osInfo; } public void setOsInfo(String v) { this.osInfo = v; }
    public String getScreenSize() { return screenSize; } public void setScreenSize(String v) { this.screenSize = v; }
    public String getRequestId() { return requestId; } public void setRequestId(String v) { this.requestId = v; }
    public String getDesktopAppVersion() { return desktopAppVersion; } public void setDesktopAppVersion(String v) { this.desktopAppVersion = v; }
    public UUID getAssessmentSessionId() { return assessmentSessionId; } public void setAssessmentSessionId(UUID v) { this.assessmentSessionId = v; }
    public String getMetadata() { return metadata; } public void setMetadata(String v) { this.metadata = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
    public OffsetDateTime getResolvedAt() { return resolvedAt; } public void setResolvedAt(OffsetDateTime v) { this.resolvedAt = v; }
}
