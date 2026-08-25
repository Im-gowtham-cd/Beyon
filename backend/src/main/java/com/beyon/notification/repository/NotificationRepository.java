package com.beyon.notification.repository;

import com.beyon.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(UUID userId);
    long countByUserIdAndReadFalse(UUID userId);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.notificationType = :type ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndType(UUID userId, String type);
}
