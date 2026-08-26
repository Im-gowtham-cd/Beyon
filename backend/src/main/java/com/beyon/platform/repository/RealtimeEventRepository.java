package com.beyon.platform.repository;

import com.beyon.platform.model.RealtimeEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RealtimeEventRepository extends JpaRepository<RealtimeEvent, UUID> {
    List<RealtimeEvent> findByUserIdAndReadFalseOrderByCreatedAtDesc(UUID userId);
    List<RealtimeEvent> findByUserIdOrderByCreatedAtDesc(UUID userId);
    long countByUserIdAndReadFalse(UUID userId);
}
