package com.beyon.profile.repository;

import com.beyon.profile.model.InstitutionPlacementHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface InstitutionPlacementHistoryRepository extends JpaRepository<InstitutionPlacementHistory, UUID> {
    List<InstitutionPlacementHistory> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
