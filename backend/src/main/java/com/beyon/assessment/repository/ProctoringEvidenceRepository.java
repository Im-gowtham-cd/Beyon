package com.beyon.assessment.repository;

import com.beyon.assessment.model.ProctoringEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProctoringEvidenceRepository extends JpaRepository<ProctoringEvidence, UUID> {
    List<ProctoringEvidence> findByIncidentIdOrderByCapturedAt(UUID incidentId);
}