package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.AlumniProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AlumniProfileRepository extends JpaRepository<AlumniProfile, UUID> {
    Optional<AlumniProfile> findByUserId(UUID userId);
    List<AlumniProfile> findByInstitutionIdAndPublicProfileTrue(UUID institutionId);
    List<AlumniProfile> findByInstitutionIdAndGraduationYear(UUID institutionId, Integer year);
    List<AlumniProfile> findByIsMentoringTrue();
}
