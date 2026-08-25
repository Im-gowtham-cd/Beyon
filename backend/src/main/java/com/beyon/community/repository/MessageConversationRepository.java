package com.beyon.community.repository;

import com.beyon.community.model.MessageConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface MessageConversationRepository extends JpaRepository<MessageConversation, UUID> {
    @Query("SELECT mc FROM MessageConversation mc JOIN mc.participants p WHERE p.userId = :userId ORDER BY mc.lastMessageAt DESC")
    List<MessageConversation> findByParticipantUserId(UUID userId);
}
