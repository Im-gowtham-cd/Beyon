package com.beyon.community.repository;

import com.beyon.community.model.SocialPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SocialPostRepository extends JpaRepository<SocialPost, UUID> {
    List<SocialPost> findByAuthorIdOrderByCreatedAtDesc(UUID authorId);
    List<SocialPost> findByVisibilityOrderByCreatedAtDesc(String visibility);
    List<SocialPost> findByPostTypeOrderByCreatedAtDesc(String postType);
}
