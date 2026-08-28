package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.AlumniConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AlumniConnectionRepository extends JpaRepository<AlumniConnection, UUID> {
    List<AlumniConnection> findByAlumniId(UUID alumniId);
    List<AlumniConnection> findByStudentId(UUID studentId);
    Optional<AlumniConnection> findByAlumniIdAndStudentIdAndConnectionType(UUID alumniId, UUID studentId, String type);
}
