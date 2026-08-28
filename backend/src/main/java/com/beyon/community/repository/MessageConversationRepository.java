package com.beyon.community.repository;

import com.beyon.community.model.MessageConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface MessageConversationRepository extends JpaRepository<MessageConversation, UUID> {
    @Query("SELECT DISTINCT mc FROM MessageConversation mc WHERE mc.id IN (SELECT m.conversationId FROM Message m WHERE m.senderId = :userId) ORDER BY mc.lastMessageAt DESC")
    List<MessageConversation> findByParticipantUserId(UUID userId);
}
