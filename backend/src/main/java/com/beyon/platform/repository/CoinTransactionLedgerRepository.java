package com.beyon.platform.repository;

import com.beyon.platform.model.CoinTransactionLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CoinTransactionLedgerRepository extends JpaRepository<CoinTransactionLedger, UUID> {
    List<CoinTransactionLedger> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<CoinTransactionLedger> findByReferenceTypeAndReferenceId(String referenceType, UUID referenceId);
}
