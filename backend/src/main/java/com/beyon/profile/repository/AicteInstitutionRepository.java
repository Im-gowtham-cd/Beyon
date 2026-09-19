package com.beyon.profile.repository;

import com.beyon.profile.model.AicteInstitution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AicteInstitutionRepository extends JpaRepository<AicteInstitution, String> {
    Optional<AicteInstitution> findByAicteId(String aicteId);
    Optional<AicteInstitution> findByAicteIdIgnoreCase(String aicteId);
    List<AicteInstitution> findByInstituteNameContainingIgnoreCase(String query);
}
