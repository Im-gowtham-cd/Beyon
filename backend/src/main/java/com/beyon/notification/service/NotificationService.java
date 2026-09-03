package com.beyon.notification.service;

import com.beyon.notification.model.Notification;
import com.beyon.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final com.beyon.platform.service.RealtimeService realtimeService;

    public NotificationService(NotificationRepository notificationRepository,
                               com.beyon.platform.service.RealtimeService realtimeService) {
        this.notificationRepository = notificationRepository;
        this.realtimeService = realtimeService;
    }

    @Transactional
    public Notification send(UUID userId, String title, String message, String type, String referenceType, UUID referenceId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(type);
        notification.setReferenceType(referenceType);
        notification.setReferenceId(referenceId);
        Notification saved = notificationRepository.save(notification);
        try {
            realtimeService.sendEvent(userId, type != null ? type : "NOTIFICATION", saved);
        } catch (Exception ignored) {}
        return saved;
    }

    public List<Notification> getNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnread(UUID userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        getUnread(userId).forEach(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public List<Notification> getByType(UUID userId, String type) {
        return notificationRepository.findByUserIdAndType(userId, type);
    }
}
