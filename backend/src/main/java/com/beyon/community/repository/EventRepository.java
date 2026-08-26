package com.beyon.community.repository;

import com.beyon.community.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
    List<Event> findByOrganizerIdOrderByEventDateDesc(UUID organizerId);
    List<Event> findByStatusAndEventDateAfterOrderByEventDateAsc(String status, LocalDate date);
    List<Event> findByEventTypeAndStatus(String eventType, String status);
    List<Event> findByOrganizerTypeAndStatus(String organizerType, String status);
}
