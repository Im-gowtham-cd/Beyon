package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.CareerPath;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface CareerPathRepository extends JpaRepository<CareerPath, UUID> {
    Optional<CareerPath> findBySlug(String slug);
    java.util.List<CareerPath> findByActiveTrue();
}
