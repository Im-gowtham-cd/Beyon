package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.InstitutionRating;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface InstitutionRatingRepository extends JpaRepository<InstitutionRating, UUID> {
    Optional<InstitutionRating> findByInstitutionId(UUID institutionId);
}
