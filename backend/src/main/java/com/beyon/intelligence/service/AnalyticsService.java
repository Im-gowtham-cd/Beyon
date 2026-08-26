package com.beyon.intelligence.service;

import com.beyon.intelligence.model.AnalyticsEvent;
import com.beyon.intelligence.repository.AnalyticsEventRepository;
import com.beyon.platform.service.CacheService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AnalyticsService {
    private final AnalyticsEventRepository eventRepo;
    private final CacheService cacheService;
    private final ObjectMapper mapper;

    public AnalyticsService(AnalyticsEventRepository eventRepo, CacheService cacheService, ObjectMapper mapper) {
        this.eventRepo = eventRepo;
        this.cacheService = cacheService;
        this.mapper = mapper;
    }

    public void trackEvent(UUID userId, String userRole, String eventType, Map<String, Object> eventData, String page) {
        AnalyticsEvent event = new AnalyticsEvent();
        event.setUserId(userId);
        event.setUserRole(userRole);
        event.setEventType(eventType);
        if (eventData != null) {
            try { event.setEventData(mapper.writeValueAsString(eventData)); } catch (Exception ignored) {}
        }
        event.setPage(page);
        eventRepo.save(event);
    }

    public Map<String, Object> getStudentAnalytics(UUID userId) {
        String cacheKey = "analytics:student:" + userId;
        return cacheService.getOrLoad(cacheKey, Map.class, Duration.ofMinutes(10), () -> {
            Map<String, Object> analytics = new LinkedHashMap<>();
            List<Object[]> eventsByType = eventRepo.countEventsByTypeForUser(userId);
            analytics.put("eventsByType", eventsByType.stream().collect(Collectors.toMap(r -> r[0], r -> r[1])));
            analytics.put("totalEvents", eventsByType.stream().mapToLong(r -> (Long) r[1]).sum());
            analytics.put("questionsStarted", eventRepo.countByUserIdAndEventType(userId, "QUESTION_STARTED"));
            analytics.put("questionsSolved", eventRepo.countByUserIdAndEventType(userId, "QUESTION_SOLVED"));
            analytics.put("coinsEarned", eventRepo.countByUserIdAndEventType(userId, "COINS_EARNED"));
            analytics.put("assessmentsCompleted", eventRepo.countByUserIdAndEventType(userId, "ASSESSMENT_COMPLETED"));
            analytics.put("opportunitiesApplied", eventRepo.countByUserIdAndEventType(userId, "OPPORTUNITY_APPLIED"));
            return analytics;
        });
    }

    public Map<String, Object> getInstitutionAnalytics(UUID institutionId) {
        return getGenericAnalytics("institution", institutionId);
    }

    public Map<String, Object> getCompanyAnalytics(UUID companyId) {
        return getGenericAnalytics("company", companyId);
    }

    public Map<String, Object> getAdminAnalytics() {
        String cacheKey = "analytics:admin:dashboard";
        return cacheService.getOrLoad(cacheKey, Map.class, Duration.ofMinutes(5), () -> {
            Map<String, Object> analytics = new LinkedHashMap<>();
            analytics.put("totalEvents", eventRepo.count());
            analytics.put("eventsByType", eventRepo.countAllEventsByType().stream()
                .collect(Collectors.toMap(r -> r[0], r -> r[1])));
            analytics.put("eventsByRole", eventRepo.countEventsByRole().stream()
                .collect(Collectors.toMap(r -> r[0], r -> r[1])));
            analytics.put("eventsByDay", eventRepo.countEventsByDay(OffsetDateTime.now().minusDays(30)));
            return analytics;
        });
    }

    private Map<String, Object> getGenericAnalytics(String type, UUID entityId) {
        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("totalEvents", eventRepo.count());
        analytics.put("eventsByType", eventRepo.countAllEventsByType().stream()
            .collect(Collectors.toMap(r -> r[0], r -> r[1])));
        return analytics;
    }
}
