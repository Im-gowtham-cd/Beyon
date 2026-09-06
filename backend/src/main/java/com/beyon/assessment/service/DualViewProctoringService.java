package com.beyon.assessment.service;

import com.beyon.assessment.model.*;
import com.beyon.assessment.repository.*;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@Transactional
public class DualViewProctoringService {

    private static final int PAIRING_TOKEN_TTL_SECONDS = 300;
    private static final int HEARTBEAT_TTL_SECONDS = 90;
    private static final String PAIR_KEY_PREFIX = "proctor:pair:";
    private static final String SESSION_STATE_PREFIX = "proctor:session:";
    private static final String DEVICE_HEARTBEAT_PREFIX = "proctor:device:";

    private final DualViewSessionRepository dvSessionRepo;
    private final ProctoringDeviceRepository deviceRepo;
    private final StringRedisTemplate redis;
    private final SseStreamService sseStreamService;
    private final SecureRandom secureRandom = new SecureRandom();

    public DualViewProctoringService(
            DualViewSessionRepository dvSessionRepo,
            ProctoringDeviceRepository deviceRepo,
            StringRedisTemplate redis,
            SseStreamService sseStreamService) {
        this.dvSessionRepo = dvSessionRepo;
        this.deviceRepo = deviceRepo;
        this.redis = redis;
        this.sseStreamService = sseStreamService;
    }

    public DualViewSession initiateDualViewSession(UUID assessmentSessionId, UUID candidateId, UUID opportunityId) {
        List<DualViewSession> existing = dvSessionRepo.findByAssessmentSessionId(assessmentSessionId);
        if (!existing.isEmpty()) return existing.get(existing.size() - 1);

        DualViewSession dvSession = new DualViewSession();
        dvSession.setAssessmentSessionId(assessmentSessionId);
        dvSession.setCandidateId(candidateId);
        dvSession.setOpportunityId(opportunityId);
        dvSession.setStatus("SETUP");
        DualViewSession saved = dvSessionRepo.save(dvSession);

        ProctoringDevice laptop = new ProctoringDevice();
        laptop.setProctoringSessionId(saved.getId());
        laptop.setDeviceType("LAPTOP");
        laptop.setConnectedAt(OffsetDateTime.now());
        laptop.setCameraActive(false);
        laptop.setMicActive(false);
        deviceRepo.save(laptop);

        String stateKey = SESSION_STATE_PREFIX + saved.getId();
        redisSet(stateKey, "{\"mobileConnected\":false,\"riskScore\":0,\"riskLevel\":\"NORMAL\"}", 24, TimeUnit.HOURS);

        return saved;
    }

    public void recordConsent(UUID dvSessionId) {
        DualViewSession session = getSession(dvSessionId);
        session.setConsentGiven(true);
        session.setConsentAt(OffsetDateTime.now());
        session.setStatus("PAIRING");
        session.setUpdatedAt(OffsetDateTime.now());
        dvSessionRepo.save(session);
    }

    public String generatePairingToken(UUID dvSessionId) {
        DualViewSession session = getSession(dvSessionId);

        List<ProctoringDevice> mobiles = deviceRepo.findByProctoringSessionIdAndDeviceType(dvSessionId, "MOBILE");
        for (ProctoringDevice d : mobiles) {
            if (!Boolean.TRUE.equals(d.getPairingTokenUsed())) {
                if (d.getPairingToken() != null) {
                    redisDelete(PAIR_KEY_PREFIX + d.getPairingToken());
                }
                deviceRepo.delete(d);
            }
        }

        String token = generateSecureToken();
        OffsetDateTime expires = OffsetDateTime.now().plusSeconds(PAIRING_TOKEN_TTL_SECONDS);

        String pairKey = PAIR_KEY_PREFIX + token;
        String pairValue = "{\"procSessionId\":\"" + dvSessionId + "\",\"candidateId\":\"" + session.getCandidateId() + "\"}";
        redisSet(pairKey, pairValue, PAIRING_TOKEN_TTL_SECONDS, TimeUnit.SECONDS);

        ProctoringDevice mobile = new ProctoringDevice();
        mobile.setProctoringSessionId(dvSessionId);
        mobile.setDeviceType("MOBILE");
        mobile.setPairingToken(token);
        mobile.setPairingTokenExpiresAt(expires);
        mobile.setPairingTokenUsed(false);
        deviceRepo.save(mobile);

        return token;
    }

    public DualViewSession consumePairingToken(String token, String userAgent, String deviceFingerprint) {
        ProctoringDevice mobile = deviceRepo.findByPairingToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired pairing token"));

        if (mobile.getPairingTokenUsed()) {
            throw new RuntimeException("Pairing token already used");
        }

        if (mobile.getPairingTokenExpiresAt() != null && mobile.getPairingTokenExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new RuntimeException("Pairing token expired");
        }

        UUID dvSessionId = mobile.getProctoringSessionId();
        DualViewSession session = getSession(dvSessionId);

        mobile.setPairingTokenUsed(true);
        mobile.setConnectedAt(OffsetDateTime.now());
        mobile.setUserAgent(userAgent);
        mobile.setDeviceFingerprint(deviceFingerprint);
        mobile.setLastHeartbeatAt(OffsetDateTime.now());
        deviceRepo.save(mobile);

        session.setMobilePaired(true);
        session.setMobileDeviceId(mobile.getId());
        session.setStatus("CALIBRATING");
        session.setUpdatedAt(OffsetDateTime.now());
        dvSessionRepo.save(session);

        redisDelete(PAIR_KEY_PREFIX + token);

        String heartbeatKey = DEVICE_HEARTBEAT_PREFIX + dvSessionId + ":mobile";
        redisSet(heartbeatKey, "connected", HEARTBEAT_TTL_SECONDS, TimeUnit.SECONDS);

        sseStreamService.pushMobileConnected(dvSessionId.toString());

        return session;
    }

    public void recordHeartbeat(UUID dvSessionId, String deviceType, boolean cameraActive, boolean micActive) {
        List<ProctoringDevice> devices = deviceRepo.findByProctoringSessionIdAndDeviceType(dvSessionId, deviceType);
        if (devices.isEmpty()) {
            throw new RuntimeException("Device not found");
        }
        ProctoringDevice device = devices.get(devices.size() - 1);

        boolean cameraWasActive = device.getCameraActive();
        device.setLastHeartbeatAt(OffsetDateTime.now());
        device.setCameraActive(cameraActive);
        device.setMicActive(micActive);
        deviceRepo.save(device);

        String heartbeatKey = DEVICE_HEARTBEAT_PREFIX + dvSessionId + ":" + deviceType.toLowerCase();
        redisSet(heartbeatKey, "connected", HEARTBEAT_TTL_SECONDS, TimeUnit.SECONDS);

        if (cameraWasActive != cameraActive) {
            sseStreamService.pushCameraActive(dvSessionId.toString(), deviceType, cameraActive);
        }

        DualViewSession session = dvSessionRepo.findById(dvSessionId).orElse(null);
        if (session != null) {
            if ("LAPTOP".equals(deviceType)) {
                session.setLaptopCameraHealth(cameraActive ? "HEALTHY" : "INACTIVE");
                session.setLaptopMicHealth(micActive ? "HEALTHY" : "INACTIVE");
            } else {
                session.setMobileCameraHealth(cameraActive ? "HEALTHY" : "INACTIVE");
                session.setMobileMicHealth(micActive ? "HEALTHY" : "INACTIVE");
                if (cameraActive && !"ACTIVE".equals(session.getStatus()) && !"COMPLETED".equals(session.getStatus())) {
                    session.setStatus("STREAMING");
                }
            }
            session.setUpdatedAt(OffsetDateTime.now());
            dvSessionRepo.save(session);
        }
    }

    public void activateSession(UUID dvSessionId) {
        DualViewSession session = getSession(dvSessionId);
        session.setStatus("ACTIVE");
        session.setStartedAt(OffsetDateTime.now());
        session.setUpdatedAt(OffsetDateTime.now());
        dvSessionRepo.save(session);
    }

    public DualViewSession completeSession(UUID dvSessionId) {
        DualViewSession session = getSession(dvSessionId);
        session.setStatus("COMPLETED");
        session.setCompletedAt(OffsetDateTime.now());
        session.setUpdatedAt(OffsetDateTime.now());

        if (session.getRiskScore() > 30 || "SUSPICIOUS".equals(session.getRiskLevel())
                || "HIGH_RISK".equals(session.getRiskLevel()) || "CRITICAL".equals(session.getRiskLevel())) {
            session.setReviewRequired(true);
        }

        return dvSessionRepo.save(session);
    }

    public void handleMobileDisconnect(UUID dvSessionId) {
        List<ProctoringDevice> devices = deviceRepo.findByProctoringSessionIdAndDeviceType(dvSessionId, "MOBILE");
        for (ProctoringDevice device : devices) {
            device.setDisconnectedAt(OffsetDateTime.now());
            device.setCameraActive(false);
            device.setMicActive(false);
            deviceRepo.save(device);
        }

        DualViewSession session = dvSessionRepo.findById(dvSessionId).orElse(null);
        if (session != null) {
            session.setMobileCameraHealth("DISCONNECTED");
            session.setMobileMicHealth("DISCONNECTED");
            session.setUpdatedAt(OffsetDateTime.now());
            dvSessionRepo.save(session);
        }

        sseStreamService.pushMobileDisconnected(dvSessionId.toString());
        sseStreamService.pushProctoringWarning(dvSessionId.toString(), "Mobile device disconnected");
    }

    public DualViewSession getSession(UUID dvSessionId) {
        return dvSessionRepo.findById(dvSessionId)
                .or(() -> findByAssessmentSessionId(dvSessionId))
                .orElse(null);
    }

    public Optional<DualViewSession> findByAssessmentSessionId(UUID assessmentSessionId) {
        List<DualViewSession> list = dvSessionRepo.findByAssessmentSessionId(assessmentSessionId);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(list.size() - 1));
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[24];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void redisSet(String key, String value, long timeout, TimeUnit unit) {
        try {
            redis.opsForValue().set(key, value, timeout, unit);
        } catch (Exception ignored) {}
    }

    private void redisDelete(String key) {
        try {
            redis.delete(key);
        } catch (Exception ignored) {}
    }
}
