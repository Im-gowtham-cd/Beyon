package com.beyon.platform.repository;

import com.beyon.platform.model.ContentResource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ContentResourceRepository extends JpaRepository<ContentResource, UUID> {
    List<ContentResource> findByStatusOrderByCreatedAtDesc(String status);
    List<ContentResource> findByResourceTypeAndStatusOrderByCreatedAtDesc(String type, String status);
    List<ContentResource> findByAuthorIdOrderByCreatedAtDesc(UUID authorId);
}
