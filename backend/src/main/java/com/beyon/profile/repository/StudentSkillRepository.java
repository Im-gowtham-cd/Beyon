package com.beyon.profile.repository;

import com.beyon.profile.model.StudentSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StudentSkillRepository extends JpaRepository<StudentSkill, UUID> {
    List<StudentSkill> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
