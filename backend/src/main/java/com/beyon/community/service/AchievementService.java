package com.beyon.community.service;

import com.beyon.community.model.*;
import com.beyon.community.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class AchievementService {
    private final VerifiedAchievementRepository achievementRepo;

    public AchievementService(VerifiedAchievementRepository achievementRepo) { this.achievementRepo = achievementRepo; }

    public VerifiedAchievement submitAchievement(UUID studentId, VerifiedAchievement achievement) {
        achievement.setStudentId(studentId);
        achievement.setVerificationStatus("PENDING");
        return achievementRepo.save(achievement);
    }

    public List<VerifiedAchievement> getMyAchievements(UUID studentId) {
        return achievementRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<VerifiedAchievement> getPendingVerifications() {
        return achievementRepo.findByVerificationStatusOrderByCreatedAtDesc("PENDING");
    }

    public VerifiedAchievement verify(UUID achievementId, UUID verifierId, String status) {
        VerifiedAchievement a = achievementRepo.findById(achievementId).orElseThrow();
        a.setVerificationStatus(status);
        a.setVerifiedBy(verifierId);
        a.setVerifiedAt(OffsetDateTime.now());
        a.setUpdatedAt(OffsetDateTime.now());
        return achievementRepo.save(a);
    }
}
