package com.beyon.community.repository;

import com.beyon.community.model.DiscussionThread;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DiscussionThreadRepository extends JpaRepository<DiscussionThread, UUID> {
    List<DiscussionThread> findByCategoryIdOrderByCreatedAtDesc(UUID categoryId);
    List<DiscussionThread> findByAuthorIdOrderByCreatedAtDesc(UUID authorId);
    List<DiscussionThread> findByOrderByCreatedAtDesc();
}
