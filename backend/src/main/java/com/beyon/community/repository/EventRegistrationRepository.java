package com.beyon.community.repository;

import com.beyon.community.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, UUID> {
    List<EventRegistration> findByStudentId(UUID studentId);
    List<EventRegistration> findByEventId(UUID eventId);
    Optional<EventRegistration> findByEventIdAndStudentId(UUID eventId, UUID studentId);
    boolean existsByEventIdAndStudentId(UUID eventId, UUID studentId);
}
