package com.beyon.institution.repository;

import com.beyon.institution.model.InstitutionRatingSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InstitutionRatingSnapshotRepository extends JpaRepository<InstitutionRatingSnapshot, UUID> {
    List<InstitutionRatingSnapshot> findByInstitutionIdOrderBySnapshotDateDesc(UUID institutionId);
    InstitutionRatingSnapshot findTopByInstitutionIdOrderBySnapshotDateDesc(UUID institutionId);
}
