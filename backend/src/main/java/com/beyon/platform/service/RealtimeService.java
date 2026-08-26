package com.beyon.platform.service;

import com.beyon.platform.model.RealtimeEvent;
import com.beyon.platform.repository.RealtimeEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Consumer;

@Service
public class RealtimeService {

    private final RealtimeEventRepository eventRepo;
    private final ObjectMapper mapper;

    private final Map<UUID, List<Consumer<String>>> subscribers = new ConcurrentHashMap<>();

    public RealtimeService(RealtimeEventRepository eventRepo, ObjectMapper mapper) {
        this.eventRepo = eventRepo;
        this.mapper = mapper;
    }

    @Transactional
    public void sendEvent(UUID userId, String eventType, Object payload) {
        try {
            RealtimeEvent event = new RealtimeEvent();
            event.setUserId(userId);
            event.setEventType(eventType);
            event.setPayload(mapper.writeValueAsString(payload));
            eventRepo.save(event);

            List<Consumer<String>> userSubscribers = subscribers.get(userId);
            if (userSubscribers != null) {
                String json = mapper.writeValueAsString(Map.of(
                    "eventType", eventType,
                    "payload", payload,
                    "timestamp", Instant.now().toString()
                ));
                userSubscribers.forEach(cb -> {
                    try { cb.accept(json); } catch (Exception ignored) {}
                });
            }
        } catch (Exception ignored) {}
    }

    public void subscribe(UUID userId, Consumer<String> callback) {
        subscribers.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(callback);
    }

    public void unsubscribe(UUID userId, Consumer<String> callback) {
        List<Consumer<String>> list = subscribers.get(userId);
        if (list != null) list.remove(callback);
    }

    public List<RealtimeEvent> getUnreadEvents(UUID userId) {
        return eventRepo.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(UUID userId) {
        return eventRepo.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID eventId) {
        eventRepo.findById(eventId).ifPresent(e -> {
            e.setRead(true);
            eventRepo.save(e);
        });
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        eventRepo.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId).forEach(e -> {
            e.setRead(true);
            eventRepo.save(e);
        });
    }
}
