package com.beyon.profile.repository;

import com.beyon.profile.model.CompanyRepresentative;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CompanyRepresentativeRepository extends JpaRepository<CompanyRepresentative, UUID> {
    List<CompanyRepresentative> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
