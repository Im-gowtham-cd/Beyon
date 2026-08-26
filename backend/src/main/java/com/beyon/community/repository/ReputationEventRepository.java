package com.beyon.community.repository;

import com.beyon.community.model.ReputationEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReputationEventRepository extends JpaRepository<ReputationEvent, UUID> {
    List<ReputationEvent> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
