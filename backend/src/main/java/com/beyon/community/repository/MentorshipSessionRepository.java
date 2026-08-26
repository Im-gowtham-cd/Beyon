package com.beyon.community.repository;

import com.beyon.community.model.MentorshipSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MentorshipSessionRepository extends JpaRepository<MentorshipSession, UUID> {
    List<MentorshipSession> findByRequestId(UUID requestId);
}
