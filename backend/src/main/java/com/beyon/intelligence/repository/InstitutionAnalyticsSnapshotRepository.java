package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.InstitutionAnalyticsSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InstitutionAnalyticsSnapshotRepository extends JpaRepository<InstitutionAnalyticsSnapshot, UUID> {
    Optional<InstitutionAnalyticsSnapshot> findByInstitutionIdAndSnapshotDate(UUID institutionId, LocalDate date);
    List<InstitutionAnalyticsSnapshot> findByInstitutionIdOrderBySnapshotDateDesc(UUID institutionId);
}
