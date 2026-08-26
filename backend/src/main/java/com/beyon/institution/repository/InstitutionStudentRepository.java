package com.beyon.institution.repository;

import com.beyon.institution.model.InstitutionStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InstitutionStudentRepository extends JpaRepository<InstitutionStudent, UUID> {
    List<InstitutionStudent> findByInstitutionId(UUID institutionId);
    List<InstitutionStudent> findByInstitutionIdAndPlacementStatus(UUID institutionId, String status);
    Optional<InstitutionStudent> findByInstitutionIdAndStudentId(UUID institutionId, UUID studentId);
    long countByInstitutionId(UUID institutionId);
    long countByInstitutionIdAndPlacementStatus(UUID institutionId, String status);
    List<InstitutionStudent> findByInstitutionIdAndDepartment(UUID institutionId, String department);
}
