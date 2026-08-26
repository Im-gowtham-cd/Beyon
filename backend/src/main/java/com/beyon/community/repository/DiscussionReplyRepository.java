package com.beyon.community.repository;

import com.beyon.community.model.DiscussionReply;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DiscussionReplyRepository extends JpaRepository<DiscussionReply, UUID> {
    List<DiscussionReply> findByThreadIdOrderByCreatedAt(UUID threadId);
    long countByThreadId(UUID threadId);
}
