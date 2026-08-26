package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.CompanyAnalyticsSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyAnalyticsSnapshotRepository extends JpaRepository<CompanyAnalyticsSnapshot, UUID> {
    Optional<CompanyAnalyticsSnapshot> findByCompanyUserIdAndSnapshotDate(UUID companyId, LocalDate date);
    List<CompanyAnalyticsSnapshot> findByCompanyUserIdOrderBySnapshotDateDesc(UUID companyId);
}
