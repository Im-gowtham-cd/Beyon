package com.beyon.community.repository;

import com.beyon.community.model.SocialComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SocialCommentRepository extends JpaRepository<SocialComment, UUID> {
    List<SocialComment> findByPostIdOrderByCreatedAt(UUID postId);
    long countByPostId(UUID postId);
}
