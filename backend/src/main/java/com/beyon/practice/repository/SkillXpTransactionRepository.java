package com.beyon.practice.repository;

import com.beyon.practice.model.SkillXpTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface SkillXpTransactionRepository extends JpaRepository<SkillXpTransaction, UUID> {
    List<SkillXpTransaction> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<SkillXpTransaction> findByStudentIdAndSkillIdOrderByCreatedAtDesc(UUID studentId, UUID skillId);
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM SkillXpTransaction t WHERE t.studentId = ?1 AND t.skillId = ?2")
    Long sumXpByStudentAndSkill(UUID studentId, UUID skillId);
    boolean existsByStudentIdAndSkillIdAndSourceAndSourceId(UUID studentId, UUID skillId, String source, UUID sourceId);
}
