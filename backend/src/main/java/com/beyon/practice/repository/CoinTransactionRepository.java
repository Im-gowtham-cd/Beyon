package com.beyon.practice.repository;

import com.beyon.practice.model.CoinTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CoinTransactionRepository extends JpaRepository<CoinTransaction, UUID> {
    List<CoinTransaction> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    Optional<CoinTransaction> findByReferenceId(UUID referenceId);

    @Query("SELECT COUNT(ct) FROM CoinTransaction ct WHERE ct.studentId = :studentId AND ct.reason = :reason AND ct.createdAt >= :since")
    long countSinceByStudentAndReason(@Param("studentId") UUID studentId, @Param("reason") String reason, @Param("since") Instant since);
}
