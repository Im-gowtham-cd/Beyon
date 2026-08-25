package com.beyon.profile.repository;

import com.beyon.profile.model.InstitutionRepresentative;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface InstitutionRepresentativeRepository extends JpaRepository<InstitutionRepresentative, UUID> {
    List<InstitutionRepresentative> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
