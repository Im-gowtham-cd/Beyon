package com.beyon.community.service;

import com.beyon.community.repository.*;
import com.beyon.intelligence.model.*;
import com.beyon.intelligence.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class DashboardService {
    private final UserReputationRepository repRepo;
    private final SmartNotificationRepository notifRepo;
    private final DiscussionThreadRepository threadRepo;
    private final SocialPostRepository postRepo;
    private final MatchingScoreRepository matchRepo;
    private final StudentSkillIntelligenceRepository skillIntelRepo;
    private final SkillGapRepository gapRepo;
    private final StudentCareerProgressRepository careerRepo;

    public DashboardService(
            UserReputationRepository repRepo,
            SmartNotificationRepository notifRepo,
            DiscussionThreadRepository threadRepo,
            SocialPostRepository postRepo,
            MatchingScoreRepository matchRepo,
            StudentSkillIntelligenceRepository skillIntelRepo,
            SkillGapRepository gapRepo,
            StudentCareerProgressRepository careerRepo) {
        this.repRepo = repRepo;
        this.notifRepo = notifRepo;
        this.threadRepo = threadRepo;
        this.postRepo = postRepo;
        this.matchRepo = matchRepo;
        this.skillIntelRepo = skillIntelRepo;
        this.gapRepo = gapRepo;
        this.careerRepo = careerRepo;
    }

    public Map<String, Object> getPersonalizedDashboard(UUID userId) {
        Map<String, Object> dashboard = new LinkedHashMap<>();

        long unreadNotifs = notifRepo.countByUserIdAndIsReadFalse(userId);
        dashboard.put("unreadNotifications", unreadNotifs);

        var reputation = repRepo.findByUserId(userId).orElse(null);
        if (reputation != null) {
            dashboard.put("reputation", Map.of(
                "total", reputation.getTotalReputation(),
                "answers", reputation.getAnswersCount(),
                "accepted", reputation.getAcceptedAnswers()
            ));
        }

        var skills = skillIntelRepo.findByStudentIdOrderByConfidenceScoreDesc(userId);
        dashboard.put("topSkills", skills.stream().limit(5).map(s -> Map.of(
            "skillId", s.getSkillId(),
            "confidenceScore", s.getConfidenceScore(),
            "proficiency", s.getProficiencyLevel(),
            "accuracy", s.getAccuracy(),
            "questionsSolved", s.getTotalQuestionsSolved()
        )).toList());

        var gaps = gapRepo.findByStudentIdOrderByGapSeverityDesc(userId);
        dashboard.put("skillGaps", gaps.stream().limit(3).map(g -> Map.of(
            "requiredSkillId", g.getRequiredSkillId(),
            "severity", g.getGapSeverity(),
            "requiredLevel", g.getRequiredLevel(),
            "currentLevel", g.getCurrentLevel()
        )).toList());

        var matches = matchRepo.findByStudentIdOrderByTotalScoreDesc(userId);
        dashboard.put("recommendedOpportunities", matches.stream().limit(3).map(m -> Map.of(
            "opportunityId", m.getOpportunityId(),
            "totalScore", m.getTotalScore(),
            "skillScore", m.getSkillScore()
        )).toList());

        var threads = threadRepo.findByOrderByCreatedAtDesc();
        dashboard.put("recentDiscussions", threads.stream().limit(3).map(t -> Map.of(
            "id", t.getId(),
            "title", t.getTitle(),
            "replyCount", t.getReplyCount(),
            "solved", t.getSolved()
        )).toList());

        var posts = postRepo.findByVisibilityOrderByCreatedAtDesc("PUBLIC");
        dashboard.put("recentPosts", posts.stream().limit(3).map(p -> Map.of(
            "id", p.getId(),
            "content", p.getContent().length() > 150 ? p.getContent().substring(0, 150) + "..." : p.getContent(),
            "likeCount", p.getLikeCount(),
            "commentCount", p.getCommentCount()
        )).toList());

        var careerProgress = careerRepo.findByStudentIdOrderByLastUpdatedAtDesc(userId);
        dashboard.put("careerProgress", careerProgress.stream().limit(2).map(cp -> Map.of(
            "careerPathId", cp.getCareerPathId(),
            "readinessScore", cp.getReadinessScore(),
            "skillsAcquired", cp.getSkillsAcquired(),
            "skillsTotal", cp.getSkillsTotal()
        )).toList());

        return dashboard;
    }
}
