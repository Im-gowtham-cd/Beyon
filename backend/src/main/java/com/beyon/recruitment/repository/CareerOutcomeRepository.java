package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.CareerOutcome;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CareerOutcomeRepository extends JpaRepository<CareerOutcome, UUID> {
    List<CareerOutcome> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<CareerOutcome> findByOutcomeTypeAndIsCurrentTrue(String outcomeType);
}
