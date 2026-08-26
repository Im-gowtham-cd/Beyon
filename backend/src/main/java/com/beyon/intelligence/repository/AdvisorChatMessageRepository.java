package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.AdvisorChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AdvisorChatMessageRepository extends JpaRepository<AdvisorChatMessage, UUID> {
    List<AdvisorChatMessage> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);
}
