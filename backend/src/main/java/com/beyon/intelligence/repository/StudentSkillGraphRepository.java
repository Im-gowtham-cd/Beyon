package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.StudentSkillGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentSkillGraphRepository extends JpaRepository<StudentSkillGraph, UUID> {
    List<StudentSkillGraph> findByStudentIdOrderByProficiencyPctDesc(UUID studentId);
    Optional<StudentSkillGraph> findByStudentIdAndSkillId(UUID studentId, UUID skillId);
    long countByStudentId(UUID studentId);
}
