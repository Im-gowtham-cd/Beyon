package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.CandidateShortlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidateShortlistRepository extends JpaRepository<CandidateShortlist, UUID> {
    List<CandidateShortlist> findByDriveIdOrderByRankInDrive(UUID driveId);
    Optional<CandidateShortlist> findByDriveIdAndStudentId(UUID driveId, UUID studentId);
    long countByDriveId(UUID driveId);
}
