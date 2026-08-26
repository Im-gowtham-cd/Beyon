package com.beyon.community.repository;

import com.beyon.community.model.VerifiedAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface VerifiedAchievementRepository extends JpaRepository<VerifiedAchievement, UUID> {
    List<VerifiedAchievement> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<VerifiedAchievement> findByVerificationStatusOrderByCreatedAtDesc(String status);
    long countByStudentIdAndVerificationStatus(UUID studentId, String status);
}
