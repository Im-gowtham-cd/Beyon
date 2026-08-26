package com.beyon.platform.repository;

import com.beyon.platform.model.ConsentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConsentRecordRepository extends JpaRepository<ConsentRecord, UUID> {
    List<ConsentRecord> findByUserId(UUID userId);
    Optional<ConsentRecord> findByUserIdAndConsentType(UUID userId, String consentType);
}
