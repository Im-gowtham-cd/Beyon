package com.beyon.assessment.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "assessment_policies")
public class AssessmentPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_user_id", nullable = false)
    private UUID companyUserId;

    @Column(name = "opportunity_id")
    private UUID opportunityId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "max_warnings_before_flag", nullable = false)
    private Integer maxWarningsBeforeFlag = 3;

    @Column(name = "max_warnings_before_terminate", nullable = false)
    private Integer maxWarningsBeforeTerminate = 5;

    @Column(name = "critical_violation_terminate", nullable = false)
    private Boolean criticalViolationTerminate = true;

    @Column(name = "allow_camera_toggle", nullable = false)
    private Boolean allowCameraToggle = false;

    @Column(name = "allow_fullscreen_exit", nullable = false)
    private Boolean allowFullscreenExit = false;

    @Column(name = "max_fullscreen_exits", nullable = false)
    private Integer maxFullscreenExits = 3;

    @Column(name = "max_session_interruptions", nullable = false)
    private Integer maxSessionInterruptions = 2;

    @Column(name = "time_extension_allowed", nullable = false)
    private Boolean timeExtensionAllowed = false;

    @Column(name = "auto_submit_on_expire", nullable = false)
    private Boolean autoSubmitOnExpire = true;

    @Column(name = "record_screen", nullable = false)
    private Boolean recordScreen = true;

    @Column(name = "record_camera", nullable = false)
    private Boolean recordCamera = true;

    @Column(name = "record_audio", nullable = false)
    private Boolean recordAudio = false;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public AssessmentPolicy() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getCompanyUserId() { return companyUserId; }
    public void setCompanyUserId(UUID companyUserId) { this.companyUserId = companyUserId; }
    public UUID getOpportunityId() { return opportunityId; }
    public void setOpportunityId(UUID opportunityId) { this.opportunityId = opportunityId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getMaxWarningsBeforeFlag() { return maxWarningsBeforeFlag; }
    public void setMaxWarningsBeforeFlag(Integer v) { this.maxWarningsBeforeFlag = v; }
    public Integer getMaxWarningsBeforeTerminate() { return maxWarningsBeforeTerminate; }
    public void setMaxWarningsBeforeTerminate(Integer v) { this.maxWarningsBeforeTerminate = v; }
    public Boolean getCriticalViolationTerminate() { return criticalViolationTerminate; }
    public void setCriticalViolationTerminate(Boolean v) { this.criticalViolationTerminate = v; }
    public Boolean getAllowCameraToggle() { return allowCameraToggle; }
    public void setAllowCameraToggle(Boolean v) { this.allowCameraToggle = v; }
    public Boolean getAllowFullscreenExit() { return allowFullscreenExit; }
    public void setAllowFullscreenExit(Boolean v) { this.allowFullscreenExit = v; }
    public Integer getMaxFullscreenExits() { return maxFullscreenExits; }
    public void setMaxFullscreenExits(Integer v) { this.maxFullscreenExits = v; }
    public Integer getMaxSessionInterruptions() { return maxSessionInterruptions; }
    public void setMaxSessionInterruptions(Integer v) { this.maxSessionInterruptions = v; }
    public Boolean getTimeExtensionAllowed() { return timeExtensionAllowed; }
    public void setTimeExtensionAllowed(Boolean v) { this.timeExtensionAllowed = v; }
    public Boolean getAutoSubmitOnExpire() { return autoSubmitOnExpire; }
    public void setAutoSubmitOnExpire(Boolean v) { this.autoSubmitOnExpire = v; }
    public Boolean getRecordScreen() { return recordScreen; }
    public void setRecordScreen(Boolean v) { this.recordScreen = v; }
    public Boolean getRecordCamera() { return recordCamera; }
    public void setRecordCamera(Boolean v) { this.recordCamera = v; }
    public Boolean getRecordAudio() { return recordAudio; }
    public void setRecordAudio(Boolean v) { this.recordAudio = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
