package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.AdvisorChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AdvisorChatSessionRepository extends JpaRepository<AdvisorChatSession, UUID> {
    List<AdvisorChatSession> findByStudentIdOrderByUpdatedAtDesc(UUID studentId);
}
