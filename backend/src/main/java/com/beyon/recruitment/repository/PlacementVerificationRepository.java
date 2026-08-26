package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.PlacementVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlacementVerificationRepository extends JpaRepository<PlacementVerification, UUID> {
    Optional<PlacementVerification> findByPlacementRecordId(UUID placementRecordId);
    List<PlacementVerification> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<PlacementVerification> findByVerificationStatus(String status);
}
