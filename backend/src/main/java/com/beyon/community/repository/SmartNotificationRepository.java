package com.beyon.community.repository;

import com.beyon.community.model.SmartNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface SmartNotificationRepository extends JpaRepository<SmartNotification, UUID> {
    List<SmartNotification> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<SmartNotification> findByUserIdAndIsReadFalseOrderByPriorityDescCreatedAtDesc(UUID userId);
    long countByUserIdAndIsReadFalse(UUID userId);

    @Modifying
    @Query("UPDATE SmartNotification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.userId = :userId AND n.isRead = false")
    int markAllAsRead(UUID userId);

    @Modifying
    @Query("UPDATE SmartNotification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.id = :id")
    int markAsRead(UUID id);
}
