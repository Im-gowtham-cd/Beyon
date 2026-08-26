package com.beyon.community.service;

import com.beyon.community.model.*;
import com.beyon.community.repository.*;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class EventService {

    private final EventRepository eventRepo;
    private final EventRegistrationRepository regRepo;
    private final UserRepository userRepo;

    public EventService(EventRepository eventRepo, EventRegistrationRepository regRepo,
                        UserRepository userRepo) {
        this.eventRepo = eventRepo;
        this.regRepo = regRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public Event createEvent(UUID organizerId, String organizerType, String title, String description,
                              String eventType, String speakerName, LocalDate eventDate,
                              java.time.LocalTime startTime, java.time.LocalTime endTime,
                              Integer capacity, Boolean isOnline, String location,
                              String meetingLink, String eligibilitySkills,
                              Integer coinReward, Integer xpReward, Boolean certificateProvided) {
        User organizer = userRepo.findById(organizerId).orElseThrow();
        Event event = new Event();
        event.setOrganizer(organizer);
        event.setOrganizerType(organizerType);
        event.setTitle(title);
        event.setDescription(description);
        event.setEventType(eventType);
        event.setSpeakerName(speakerName);
        event.setEventDate(eventDate);
        event.setStartTime(startTime);
        event.setEndTime(endTime);
        event.setCapacity(capacity);
        event.setIsOnline(isOnline);
        event.setLocation(location);
        event.setMeetingLink(meetingLink);
        event.setEligibilitySkills(eligibilitySkills);
        event.setCoinReward(coinReward);
        event.setXpReward(xpReward);
        event.setCertificateProvided(certificateProvided);
        event.setStatus("PUBLISHED");
        return eventRepo.save(event);
    }

    public List<Event> getPublishedEvents() {
        return eventRepo.findByStatusAndEventDateAfterOrderByEventDateAsc("PUBLISHED", LocalDate.now());
    }

    public List<Event> getEventsByOrganizer(UUID organizerId) {
        return eventRepo.findByOrganizerIdOrderByEventDateDesc(organizerId);
    }

    @Transactional
    public EventRegistration registerForEvent(UUID eventId, UUID studentId) {
        if (regRepo.existsByEventIdAndStudentId(eventId, studentId)) {
            throw new RuntimeException("Already registered for this event");
        }
        Event event = eventRepo.findById(eventId).orElseThrow();
        if (event.getCapacity() != null && event.getRegisteredCount() >= event.getCapacity()) {
            throw new RuntimeException("Event is at full capacity");
        }
        User student = userRepo.findById(studentId).orElseThrow();
        EventRegistration reg = new EventRegistration();
        reg.setEvent(event);
        reg.setStudent(student);
        event.setRegisteredCount(event.getRegisteredCount() + 1);
        eventRepo.save(event);
        return regRepo.save(reg);
    }

    public List<EventRegistration> getMyRegistrations(UUID studentId) {
        return regRepo.findByStudentId(studentId);
    }

    public List<EventRegistration> getEventRegistrations(UUID eventId) {
        return regRepo.findByEventId(eventId);
    }
}
