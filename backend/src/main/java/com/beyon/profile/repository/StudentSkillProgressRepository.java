package com.beyon.profile.repository;

import com.beyon.profile.model.StudentSkillProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentSkillProgressRepository extends JpaRepository<StudentSkillProgress, UUID> {
    List<StudentSkillProgress> findByStudentIdAndSkillId(UUID studentId, UUID skillId);
    Optional<StudentSkillProgress> findByStudentIdAndSkillIdAndTopicId(UUID studentId, UUID skillId, UUID topicId);
    List<StudentSkillProgress> findByStudentId(UUID studentId);
}
