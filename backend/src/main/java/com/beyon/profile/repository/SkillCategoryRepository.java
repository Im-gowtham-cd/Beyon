package com.beyon.profile.repository;

import com.beyon.profile.model.SkillCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SkillCategoryRepository extends JpaRepository<SkillCategory, UUID> {
    Optional<SkillCategory> findBySlug(String slug);

    @Query("SELECT c FROM SkillCategory c WHERE c.active = true ORDER BY c.displayOrder, c.name")
    List<SkillCategory> findAllActive();
}
