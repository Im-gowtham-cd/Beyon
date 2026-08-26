package com.beyon.platform.repository;

import com.beyon.platform.model.FraudSignal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FraudSignalRepository extends JpaRepository<FraudSignal, UUID> {
    List<FraudSignal> findByStatus(String status);
    List<FraudSignal> findByUserId(UUID userId);
    long countByUserIdAndSignalType(UUID userId, String signalType);
}
