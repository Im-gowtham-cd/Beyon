package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.EntityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface EntityPostRepository extends JpaRepository<EntityPost, UUID> {
    List<EntityPost> findByEntityIdAndEntityTypeOrderByCreatedAtDesc(UUID entityId, String entityType);
    List<EntityPost> findByVisibilityOrderByCreatedAtDesc(String visibility);
    List<EntityPost> findByPostTypeOrderByCreatedAtDesc(String postType);
}
