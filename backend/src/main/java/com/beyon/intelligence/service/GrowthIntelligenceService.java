package com.beyon.intelligence.service;

import com.beyon.intelligence.model.StudentGrowthScore;
import com.beyon.intelligence.repository.StudentGrowthScoreRepository;
import com.beyon.intelligence.repository.StudentSkillIntelligenceRepository;
import com.beyon.practice.model.SkillLevel;
import com.beyon.practice.repository.*;
import com.beyon.profile.repository.StudentCertificateRepository;
import com.beyon.profile.repository.StudentProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class GrowthIntelligenceService {

    private final StudentGrowthScoreRepository growthRepo;
    private final StudentSkillIntelligenceRepository skillIntelRepo;
    private final StudentStreakRepository streakRepo;
    private final WeeklyTestAttemptRepository weeklyTestRepo;
    private final StudentCertificateRepository certRepo;
    private final StudentProjectRepository projectRepo;
    private final SkillLevelRepository skillLevelRepo;

    public GrowthIntelligenceService(StudentGrowthScoreRepository growthRepo,
                                      StudentSkillIntelligenceRepository skillIntelRepo,
                                      StudentStreakRepository streakRepo,
                                      WeeklyTestAttemptRepository weeklyTestRepo,
                                      StudentCertificateRepository certRepo,
                                      StudentProjectRepository projectRepo,
                                      SkillLevelRepository skillLevelRepo) {
        this.growthRepo = growthRepo;
        this.skillIntelRepo = skillIntelRepo;
        this.streakRepo = streakRepo;
        this.weeklyTestRepo = weeklyTestRepo;
        this.certRepo = certRepo;
        this.projectRepo = projectRepo;
        this.skillLevelRepo = skillLevelRepo;
    }

    @Transactional
    public StudentGrowthScore computeGrowthScore(UUID studentId) {
        BigDecimal skillsScore = computeSkillsScore(studentId);
        BigDecimal consistencyScore = computeConsistencyScore(studentId);
        BigDecimal assessmentScore = computeAssessmentScore(studentId);
        BigDecimal certificationScore = computeCertificationScore(studentId);
        BigDecimal projectScore = computeProjectScore(studentId);

        BigDecimal overall = skillsScore.multiply(new BigDecimal("0.30"))
                .add(consistencyScore.multiply(new BigDecimal("0.20")))
                .add(assessmentScore.multiply(new BigDecimal("0.20")))
                .add(certificationScore.multiply(new BigDecimal("0.15")))
                .add(projectScore.multiply(new BigDecimal("0.15")))
                .setScale(1, RoundingMode.HALF_UP);

        String readiness = overall.compareTo(new BigDecimal("90")) >= 0 ? "HIGHLY_COMPETITIVE"
                : overall.compareTo(new BigDecimal("75")) >= 0 ? "INDUSTRY_READY"
                : overall.compareTo(new BigDecimal("55")) >= 0 ? "ALMOST_READY"
                : overall.compareTo(new BigDecimal("30")) >= 0 ? "DEVELOPING" : "NOT_READY";

        StudentGrowthScore score = growthRepo.findByStudentId(studentId).orElse(new StudentGrowthScore());
        score.setStudentId(studentId);
        score.setOverallScore(overall);
        score.setSkillsScore(skillsScore);
        score.setConsistencyScore(consistencyScore);
        score.setAssessmentScore(assessmentScore);
        score.setCertificationScore(certificationScore);
        score.setProjectScore(projectScore);
        score.setCareerReadyScore(overall);
        score.setCareerReadiness(readiness);
        return growthRepo.save(score);
    }

    private BigDecimal computeSkillsScore(UUID studentId) {
        List<SkillLevel> levels = skillLevelRepo.findByStudentIdOrderByTotalXpDesc(studentId);
        if (levels.isEmpty()) return BigDecimal.ZERO;
        int totalLevel = 0;
        for (SkillLevel l : levels) totalLevel += l.getLevel();
        return BigDecimal.valueOf(Math.min(100, totalLevel * 20));
    }

    private BigDecimal computeConsistencyScore(UUID studentId) {
        var streak = streakRepo.findByStudentId(studentId).orElse(null);
        if (streak == null) return BigDecimal.ZERO;
        int current = streak.getCurrentStreak();
        int longest = streak.getLongestStreak();
        return BigDecimal.valueOf(Math.min(100, current * 3 + longest));
    }

    private BigDecimal computeAssessmentScore(UUID studentId) {
        var tests = weeklyTestRepo.findByStudentIdOrderByStartedAtDesc(studentId);
        if (tests.isEmpty()) return BigDecimal.ZERO;
        double avgScore = tests.stream().mapToInt(t -> t.getCorrectAnswers()).average().orElse(0);
        return BigDecimal.valueOf(Math.min(100, avgScore * 2.5)).setScale(1, RoundingMode.HALF_UP);
    }

    private BigDecimal computeCertificationScore(UUID studentId) {
        long count = certRepo.findByStudentIdOrderByCreatedAtDesc(studentId).size();
        return BigDecimal.valueOf(Math.min(100, count * 25));
    }

    private BigDecimal computeProjectScore(UUID studentId) {
        long count = projectRepo.findByUserId(studentId).size();
        return BigDecimal.valueOf(Math.min(100, count * 20));
    }

    public StudentGrowthScore getGrowthScore(UUID studentId) {
        return growthRepo.findByStudentId(studentId).orElseGet(() -> computeGrowthScore(studentId));
    }

    public Map<String, Object> getStudentInsights(UUID studentId) {
        StudentGrowthScore score = getGrowthScore(studentId);
        List<SkillLevel> levels = skillLevelRepo.findByStudentIdOrderByTotalXpDesc(studentId);
        List<String> strongSkills = new ArrayList<>();
        List<String> improveSkills = new ArrayList<>();
        for (SkillLevel l : levels) {
            if (l.getLevel() >= 3) strongSkills.add("Skill " + l.getSkillId());
            else improveSkills.add("Skill " + l.getSkillId());
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("growthScore", score);
        result.put("strongSkills", strongSkills);
        result.put("improveSkills", improveSkills);
        result.put("careerReadiness", score.getCareerReadiness());
        result.put("readinessLabel", getReadinessLabel(score.getCareerReadiness()));
        return result;
    }

    private String getReadinessLabel(String readiness) {
        return switch (readiness) {
            case "HIGHLY_COMPETITIVE" -> "Highly Competitive";
            case "INDUSTRY_READY" -> "Industry Ready";
            case "ALMOST_READY" -> "Almost Ready";
            case "DEVELOPING" -> "Developing";
            default -> "Not Ready";
        };
    }
}
