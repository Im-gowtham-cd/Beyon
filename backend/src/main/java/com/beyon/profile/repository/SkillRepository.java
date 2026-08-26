package com.beyon.profile.repository;

import com.beyon.profile.model.Skill;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SkillRepository extends JpaRepository<Skill, UUID> {

    Optional<Skill> findBySlug(String slug);

    boolean existsByNameIgnoreCase(String name);

    @Query("SELECT s FROM Skill s WHERE s.active = true AND LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY s.name")
    List<Skill> searchByName(@Param("search") String search, Pageable pageable);

    @Query("SELECT s FROM Skill s WHERE s.active = true AND s.category = :category ORDER BY s.name")
    List<Skill> findByCategory(@Param("category") String category);

    @Query("SELECT s FROM Skill s WHERE s.active = true ORDER BY s.category, s.name")
    List<Skill> findAllActive();

    List<Skill> findByCategoryIdAndActiveTrue(UUID categoryId);
}
