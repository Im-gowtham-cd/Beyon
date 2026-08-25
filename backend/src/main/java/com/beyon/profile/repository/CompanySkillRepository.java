package com.beyon.profile.repository;

import com.beyon.profile.model.CompanySkill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CompanySkillRepository extends JpaRepository<CompanySkill, UUID> {
    List<CompanySkill> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
