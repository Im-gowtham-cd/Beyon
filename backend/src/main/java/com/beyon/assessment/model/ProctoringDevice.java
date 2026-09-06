package com.beyon.assessment.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "proctoring_devices")
public class ProctoringDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "proctoring_session_id", nullable = false, length = 36)
    private UUID proctoringSessionId;

    @Column(name = "device_type", nullable = false, length = 20)
    private String deviceType;

    @Column(name = "pairing_token", length = 256)
    private String pairingToken;

    @Column(name = "pairing_token_expires_at")
    private OffsetDateTime pairingTokenExpiresAt;

    @Column(name = "pairing_token_used", nullable = false)
    private Boolean pairingTokenUsed = false;

    @Column(name = "device_fingerprint", length = 512)
    private String deviceFingerprint;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Column(name = "connected_at")
    private OffsetDateTime connectedAt;

    @Column(name = "disconnected_at")
    private OffsetDateTime disconnectedAt;

    @Column(name = "reconnect_count", nullable = false)
    private Integer reconnectCount = 0;

    @Column(name = "camera_active", nullable = false)
    private Boolean cameraActive = false;

    @Column(name = "mic_active", nullable = false)
    private Boolean micActive = false;

    @Column(name = "last_heartbeat_at")
    private OffsetDateTime lastHeartbeatAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public ProctoringDevice() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getProctoringSessionId() { return proctoringSessionId; }
    public void setProctoringSessionId(UUID v) { this.proctoringSessionId = v; }
    public String getDeviceType() { return deviceType; }
    public void setDeviceType(String v) { this.deviceType = v; }
    public String getPairingToken() { return pairingToken; }
    public void setPairingToken(String v) { this.pairingToken = v; }
    public OffsetDateTime getPairingTokenExpiresAt() { return pairingTokenExpiresAt; }
    public void setPairingTokenExpiresAt(OffsetDateTime v) { this.pairingTokenExpiresAt = v; }
    public Boolean getPairingTokenUsed() { return pairingTokenUsed; }
    public void setPairingTokenUsed(Boolean v) { this.pairingTokenUsed = v; }
    public String getDeviceFingerprint() { return deviceFingerprint; }
    public void setDeviceFingerprint(String v) { this.deviceFingerprint = v; }
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String v) { this.userAgent = v; }
    public OffsetDateTime getConnectedAt() { return connectedAt; }
    public void setConnectedAt(OffsetDateTime v) { this.connectedAt = v; }
    public OffsetDateTime getDisconnectedAt() { return disconnectedAt; }
    public void setDisconnectedAt(OffsetDateTime v) { this.disconnectedAt = v; }
    public Integer getReconnectCount() { return reconnectCount; }
    public void setReconnectCount(Integer v) { this.reconnectCount = v; }
    public Boolean getCameraActive() { return cameraActive; }
    public void setCameraActive(Boolean v) { this.cameraActive = v; }
    public Boolean getMicActive() { return micActive; }
    public void setMicActive(Boolean v) { this.micActive = v; }
    public OffsetDateTime getLastHeartbeatAt() { return lastHeartbeatAt; }
    public void setLastHeartbeatAt(OffsetDateTime v) { this.lastHeartbeatAt = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}

