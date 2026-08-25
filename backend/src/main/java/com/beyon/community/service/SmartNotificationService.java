package com.beyon.community.service;

import com.beyon.community.model.SmartNotification;
import com.beyon.community.repository.SmartNotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class SmartNotificationService {
    private final SmartNotificationRepository notifRepo;

    public SmartNotificationService(SmartNotificationRepository notifRepo) {
        this.notifRepo = notifRepo;
    }

    public SmartNotification send(UUID userId, String type, String priority, String title, String body, String actionUrl, String refType, UUID refId) {
        SmartNotification n = new SmartNotification();
        n.setUserId(userId);
        n.setNotificationType(type);
        n.setPriority(priority != null ? priority : "NORMAL");
        n.setTitle(title);
        n.setBody(body);
        n.setActionUrl(actionUrl);
        n.setReferenceType(refType);
        n.setReferenceId(refId);
        n.setDeliveryStatus("DELIVERED");
        n.setDeliveredAt(OffsetDateTime.now());
        return notifRepo.save(n);
    }

    public List<SmartNotification> getNotifications(UUID userId) {
        return notifRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<SmartNotification> getUnread(UUID userId) {
        return notifRepo.findByUserIdAndIsReadFalseOrderByPriorityDescCreatedAtDesc(userId);
    }

    public long getUnreadCount(UUID userId) {
        return notifRepo.countByUserIdAndIsReadFalse(userId);
    }

    public void markRead(UUID notificationId) {
        notifRepo.markAsRead(notificationId);
    }

    public int markAllRead(UUID userId) {
        return notifRepo.markAllAsRead(userId);
    }

    public SmartNotification notifyOpportunity(UUID userId, String title, String body, UUID opportunityId) {
        return send(userId, "OPPORTUNITY", "HIGH", title, body, "/opportunities", "OPPORTUNITY", opportunityId);
    }

    public SmartNotification notifyAssessment(UUID userId, String title, String body, UUID sessionId) {
        return send(userId, "ASSESSMENT", "HIGH", title, body, "/assessment", "ASSESSMENT", sessionId);
    }

    public SmartNotification notifyAchievement(UUID userId, String title, String body) {
        return send(userId, "ACHIEVEMENT", "NORMAL", title, body, "/portfolio", null, null);
    }

    public SmartNotification notifyCommunity(UUID userId, String title, String body, String refType, UUID refId) {
        return send(userId, "COMMUNITY", "NORMAL", title, body, "/feed", refType, refId);
    }

    public SmartNotification notifyLearning(UUID userId, String title, String body) {
        return send(userId, "LEARNING", "LOW", title, body, "/skill-profile", null, null);
    }
}
