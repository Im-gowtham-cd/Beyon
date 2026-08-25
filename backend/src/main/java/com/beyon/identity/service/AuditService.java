package com.beyon.identity.service;

import com.beyon.identity.enums.AuditEventType;
import com.beyon.identity.model.AuditEvent;
import com.beyon.identity.repository.AuditEventRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditEventRepository auditEventRepository;

    public AuditService(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    public void log(AuditEventType eventType, String email, String ipAddress, String userAgent) {
        AuditEvent event = new AuditEvent();
        event.setEventType(eventType);
        event.setEmail(email);
        event.setIpAddress(ipAddress);
        event.setUserAgent(userAgent);
        auditEventRepository.save(event);
    }
}
