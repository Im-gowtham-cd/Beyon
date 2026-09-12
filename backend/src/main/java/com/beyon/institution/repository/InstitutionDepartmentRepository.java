package com.beyon.institution.repository;

import com.beyon.institution.model.InstitutionDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InstitutionDepartmentRepository extends JpaRepository<InstitutionDepartment, UUID> {
    List<InstitutionDepartment> findByInstitutionIdOrderByDepartmentNameAsc(UUID institutionId);
    Optional<InstitutionDepartment> findByInstitutionIdAndDepartmentCodeIgnoreCase(UUID institutionId, String departmentCode);
    boolean existsByInstitutionIdAndDepartmentCodeIgnoreCase(UUID institutionId, String departmentCode);
}
