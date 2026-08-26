package com.beyon.platform.repository;

import com.beyon.platform.model.BackgroundJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface BackgroundJobRepository extends JpaRepository<BackgroundJob, UUID> {

    @Query("SELECT j FROM BackgroundJob j WHERE j.status = 'PENDING' AND (j.nextRetryAt IS NULL OR j.nextRetryAt <= :now) ORDER BY j.priority DESC, j.createdAt ASC LIMIT 10")
    List<BackgroundJob> findPendingJobs(@Param("now") OffsetDateTime now);

    long countByStatus(String status);

    @Modifying
    @Transactional
    @Query("DELETE FROM BackgroundJob j WHERE j.status = 'COMPLETED' AND j.completedAt < :cutoff")
    int deleteCompletedBefore(@Param("cutoff") OffsetDateTime cutoff);
}
