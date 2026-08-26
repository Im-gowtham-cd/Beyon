package com.beyon.profile.repository;

import com.beyon.profile.model.SkillEndorsement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SkillEndorsementRepository extends JpaRepository<SkillEndorsement, UUID> {
    List<SkillEndorsement> findByStudentIdAndStatusOrderByCreatedAtDesc(UUID studentId, String status);
    List<SkillEndorsement> findByStudentIdAndSkillIdAndStatus(UUID studentId, UUID skillId, String status);
    long countByStudentIdAndSkillIdAndStatus(UUID studentId, UUID skillId, String status);
}
