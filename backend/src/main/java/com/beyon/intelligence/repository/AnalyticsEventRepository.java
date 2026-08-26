package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, UUID> {
    long countByEventType(String eventType);
    long countByUserIdAndEventType(UUID userId, String eventType);

    @Query("SELECT a.eventType, COUNT(a) FROM AnalyticsEvent a WHERE a.userId = :userId GROUP BY a.eventType")
    List<Object[]> countEventsByTypeForUser(UUID userId);

    @Query("SELECT a.eventType, COUNT(a) FROM AnalyticsEvent a GROUP BY a.eventType ORDER BY COUNT(a) DESC")
    List<Object[]> countAllEventsByType();

    @Query("SELECT a.userRole, COUNT(a) FROM AnalyticsEvent a GROUP BY a.userRole")
    List<Object[]> countEventsByRole();

    @Query("SELECT FUNCTION('DATE', a.createdAt), COUNT(a) FROM AnalyticsEvent a WHERE a.createdAt >= :since GROUP BY FUNCTION('DATE', a.createdAt) ORDER BY FUNCTION('DATE', a.createdAt) DESC")
    List<Object[]> countEventsByDay(java.time.OffsetDateTime since);
}
