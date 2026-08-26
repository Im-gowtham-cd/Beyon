package com.beyon.practice.service;

import com.beyon.practice.model.StudentAchievementBadge;
import com.beyon.practice.repository.StudentAchievementBadgeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AchievementBadgeService {

    private final StudentAchievementBadgeRepository badgeRepo;

    private static final Map<String, Map<String, String>> BADGE_DEFINITIONS = new LinkedHashMap<>();
    static {
        BADGE_DEFINITIONS.put("LEARNING_STARTER", Map.of("name","Learning Starter","desc","Completed first daily challenge","icon","🌟","category","LEARNING","rarity","COMMON"));
        BADGE_DEFINITIONS.put("7_DAY_STREAK", Map.of("name","7-Day Learner","desc","Maintained 7-day streak","icon","🔥","category","CONSISTENCY","rarity","UNCOMMON"));
        BADGE_DEFINITIONS.put("30_DAY_STREAK", Map.of("name","30-Day Master","desc","Maintained 30-day streak","icon","🔥","category","CONSISTENCY","rarity","RARE"));
        BADGE_DEFINITIONS.put("100_PROBLEMS", Map.of("name","Century Solver","desc","Solved 100 problems","icon","💻","category","PRACTICE","rarity","UNCOMMON"));
        BADGE_DEFINITIONS.put("TOP_10_PERCENT", Map.of("name","Top Performer","desc","Ranked in top 10%","icon","🏆","category","ASSESSMENT","rarity","EPIC"));
        BADGE_DEFINITIONS.put("CERTIFICATION_EARNED", Map.of("name","Certified","desc","Earned a certification","icon","🎓","category","CAREER","rarity","UNCOMMON"));
        BADGE_DEFINITIONS.put("FIRST_APPLICATION", Map.of("name","Job Seeker","desc","Applied to first opportunity","icon","🏢","category","CAREER","rarity","COMMON"));
        BADGE_DEFINITIONS.put("COMMUNITY CONTRIBUTOR", Map.of("name","Community Star","desc","Active in community","icon","⭐","category","COMMUNITY","rarity","COMMON"));
        BADGE_DEFINITIONS.put("500_COINS", Map.of("name","Coin Collector","desc","Earned 500 Beyon Coins","icon","💰","category","LEARNING","rarity","UNCOMMON"));
        BADGE_DEFINITIONS.put("INDUSTRY_READY", Map.of("name","Industry Ready","desc","Achieved Industry Ready level","icon","🚀","category","CAREER","rarity","LEGENDARY"));
    }

    public AchievementBadgeService(StudentAchievementBadgeRepository badgeRepo) {
        this.badgeRepo = badgeRepo;
    }

    @Transactional
    public StudentAchievementBadge awardBadge(UUID studentId, String achievementKey) {
        if (badgeRepo.existsByStudentIdAndAchievementKey(studentId, achievementKey)) {
            return null;
        }
        Map<String, String> def = BADGE_DEFINITIONS.get(achievementKey);
        if (def == null) return null;
        StudentAchievementBadge badge = new StudentAchievementBadge();
        badge.setStudentId(studentId);
        badge.setAchievementKey(achievementKey);
        badge.setAchievementName(def.get("name"));
        badge.setDescription(def.get("desc"));
        badge.setBadgeIcon(def.get("icon"));
        return badgeRepo.save(badge);
    }

    public List<StudentAchievementBadge> getBadges(UUID studentId) {
        return badgeRepo.findByStudentIdOrderByEarnedAtDesc(studentId);
    }

    public Map<String, Object> getBadgeProgress(UUID studentId) {
        List<StudentAchievementBadge> earned = getBadges(studentId);
        Set<String> earnedKeys = new HashSet<>();
        for (StudentAchievementBadge b : earned) earnedKeys.add(b.getAchievementKey());
        List<Map<String, Object>> allBadges = new ArrayList<>();
        for (Map.Entry<String, Map<String, String>> e : BADGE_DEFINITIONS.entrySet()) {
            Map<String, Object> badge = new LinkedHashMap<>(e.getValue());
            badge.put("key", e.getKey());
            badge.put("unlocked", earnedKeys.contains(e.getKey()));
            allBadges.add(badge);
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalBadges", BADGE_DEFINITIONS.size());
        result.put("unlockedCount", earned.size());
        result.put("badges", allBadges);
        return result;
    }
}
