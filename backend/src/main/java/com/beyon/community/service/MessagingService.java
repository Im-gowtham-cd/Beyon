package com.beyon.community.service;

import com.beyon.community.model.*;
import com.beyon.community.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class MessagingService {
    private final MessageConversationRepository convRepo;
    private final MessageRepository msgRepo;

    public MessagingService(MessageConversationRepository convRepo, MessageRepository msgRepo) {
        this.convRepo = convRepo;
        this.msgRepo = msgRepo;
    }

    public MessageConversation startConversation(UUID senderId, UUID recipientId, String firstMessage) {
        MessageConversation conv = new MessageConversation();
        conv.setConversationType("DIRECT");
        conv.setLastMessageAt(OffsetDateTime.now());
        conv.setLastMessagePreview(firstMessage.length() > 100 ? firstMessage.substring(0, 100) : firstMessage);
        conv = convRepo.save(conv);

        Message msg = new Message();
        msg.setConversationId(conv.getId());
        msg.setSenderId(senderId);
        msg.setContent(firstMessage);
        msgRepo.save(msg);

        return conv;
    }

    public List<MessageConversation> getMyConversations(UUID userId) {
        return convRepo.findByParticipantUserId(userId);
    }

    public List<Message> getMessages(UUID conversationId, int page, int size) {
        return msgRepo.findByConversationIdOrderByCreatedAtDesc(conversationId, PageRequest.of(page, size)).getContent();
    }

    public Message sendMessage(UUID conversationId, UUID senderId, String content) {
        Message msg = new Message();
        msg.setConversationId(conversationId);
        msg.setSenderId(senderId);
        msg.setContent(content);
        Message saved = msgRepo.save(msg);

        MessageConversation conv = convRepo.findById(conversationId).orElseThrow();
        conv.setLastMessageAt(OffsetDateTime.now());
        conv.setLastMessagePreview(content.length() > 100 ? content.substring(0, 100) : content);
        convRepo.save(conv);

        return saved;
    }
}
