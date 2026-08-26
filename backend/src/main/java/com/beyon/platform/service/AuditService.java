package com.beyon.platform.service;

import com.beyon.platform.model.SecurityAuditLog;
import com.beyon.platform.repository.SecurityAuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class AuditService {
    private final SecurityAuditLogRepository auditRepo;
    private final ObjectMapper mapper;

    public AuditService(SecurityAuditLogRepository auditRepo, ObjectMapper mapper) {
        this.auditRepo = auditRepo;
        this.mapper = mapper;
    }

    public void log(UUID userId, String action, String resourceType, UUID resourceId, String ipAddress, String userAgent, Map<String, Object> details) {
        SecurityAuditLog entry = new SecurityAuditLog();
        entry.setUserId(userId);
        entry.setAction(action);
        entry.setResourceType(resourceType);
        entry.setResourceId(resourceId);
        entry.setIpAddress(ipAddress);
        entry.setUserAgent(userAgent);
        if (details != null) {
            try {
                entry.setDetails(mapper.writeValueAsString(details));
            } catch (Exception ignored) {}
        }
        auditRepo.save(entry);
    }

    public void logLogin(UUID userId, String ipAddress, String userAgent, boolean success) {
        log(userId, success ? "LOGIN_SUCCESS" : "LOGIN_FAILED", "USER", userId, ipAddress, userAgent,
            Map.of("success", success));
    }

    public void logRegistration(UUID userId, String ipAddress, String userAgent) {
        log(userId, "REGISTRATION", "USER", userId, ipAddress, userAgent, null);
    }

    public void logPasswordChange(UUID userId, String ipAddress) {
        log(userId, "PASSWORD_CHANGE", "USER", userId, ipAddress, null, null);
    }

    public void logCoinTransaction(UUID userId, String action, UUID transactionId, int amount) {
        log(userId, action, "COIN_TRANSACTION", transactionId, null, null, Map.of("amount", amount));
    }

    public void logAssessmentStart(UUID userId, UUID sessionId) {
        log(userId, "ASSESSMENT_START", "ASSESSMENT_SESSION", sessionId, null, null, null);
    }

    public void logDataExport(UUID userId, String dataType) {
        log(userId, "DATA_EXPORT", "USER_DATA", userId, null, null, Map.of("dataType", dataType));
    }

    public void logAccountDeletion(UUID userId, String ipAddress) {
        log(userId, "ACCOUNT_DELETION_REQUEST", "USER", userId, ipAddress, null, null);
    }
}
