package com.beyon.practice.repository;

import com.beyon.practice.model.CoinTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface CoinTransactionRepository extends JpaRepository<CoinTransaction, UUID> {
    List<CoinTransaction> findByStudentIdOrderByCreatedAtDesc(UUID studentId);

    @Query("SELECT COUNT(ct) FROM CoinTransaction ct WHERE ct.studentId = :studentId AND ct.reason = :reason AND ct.createdAt >= CURRENT_TIMESTAMP")
    long countTodayByStudentAndReason(UUID studentId, String reason);
}
