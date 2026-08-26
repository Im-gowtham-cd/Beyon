package com.beyon.platform.repository;

import com.beyon.platform.model.PlatformDailyStats;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlatformDailyStatsRepository extends JpaRepository<PlatformDailyStats, UUID> {
    Optional<PlatformDailyStats> findByStatDate(LocalDate date);
    List<PlatformDailyStats> findByStatDateBetweenOrderByStatDateDesc(LocalDate start, LocalDate end);
    List<PlatformDailyStats> findTop30ByOrderByStatDateDesc();
}
