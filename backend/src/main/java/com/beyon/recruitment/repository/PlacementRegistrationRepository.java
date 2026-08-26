package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.PlacementRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlacementRegistrationRepository extends JpaRepository<PlacementRegistration, UUID> {
    Optional<PlacementRegistration> findByStudentId(UUID studentId);
    List<PlacementRegistration> findByInstitutionIdAndPlacementPreference(UUID institutionId, String preference);
    long countByInstitutionIdAndPlacementPreference(UUID institutionId, String preference);
}
