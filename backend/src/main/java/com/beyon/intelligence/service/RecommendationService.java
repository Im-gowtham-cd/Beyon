package com.beyon.intelligence.service;

import com.beyon.intelligence.model.SkillRecommendation;
import com.beyon.intelligence.model.StudentSkillIntelligence;
import com.beyon.intelligence.model.SkillGap;
import com.beyon.intelligence.repository.SkillRecommendationRepository;
import com.beyon.intelligence.repository.StudentSkillIntelligenceRepository;
import com.beyon.intelligence.repository.SkillGapRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class RecommendationService {
    private final SkillRecommendationRepository recRepo;
    private final StudentSkillIntelligenceRepository skillIntelRepo;
    private final SkillGapRepository gapRepo;

    public RecommendationService(SkillRecommendationRepository recRepo, StudentSkillIntelligenceRepository skillIntelRepo, SkillGapRepository gapRepo) {
        this.recRepo = recRepo;
        this.skillIntelRepo = skillIntelRepo;
        this.gapRepo = gapRepo;
    }

    public List<SkillRecommendation> getRecommendations(UUID studentId) {
        return recRepo.findByStudentIdAndStatusOrderByScoreDesc(studentId, "PENDING");
    }

    public List<SkillRecommendation> generateRecommendations(UUID studentId) {
        recRepo.deleteAll(recRepo.findByStudentIdAndStatusOrderByScoreDesc(studentId, "PENDING"));

        List<SkillRecommendation> recs = new ArrayList<>();

        List<SkillGap> gaps = gapRepo.findByStudentIdOrderByGapSeverityDesc(studentId);
        for (SkillGap gap : gaps) {
            SkillRecommendation rec = new SkillRecommendation();
            rec.setStudentId(studentId);
            rec.setSkillId(gap.getRequiredSkillId());
            rec.setSkillName("Skill " + gap.getRequiredSkillId().toString().substring(0, 8));
            rec.setRecommendationType("PRACTICE");
            rec.setScore(calculateGapScore(gap));
            rec.setReason(buildGapReason(gap));
            recs.add(rec);
        }

        List<StudentSkillIntelligence> weakSkills = skillIntelRepo.findByStudentIdOrderByConfidenceScoreDesc(studentId)
            .stream().filter(s -> s.getConfidenceScore().compareTo(new BigDecimal("0.6")) < 0)
            .limit(5).collect(Collectors.toList());

        for (StudentSkillIntelligence skill : weakSkills) {
            SkillRecommendation rec = new SkillRecommendation();
            rec.setStudentId(studentId);
            rec.setSkillId(skill.getSkillId());
            rec.setSkillName("Skill " + skill.getSkillId().toString().substring(0, 8));
            rec.setRecommendationType("ASSESSMENT");
            rec.setScore(skill.getConfidenceScore().multiply(new BigDecimal("100")));
            rec.setReason("Your confidence is " + skill.getConfidenceScore() + ". Practice to improve.");
            recs.add(rec);
        }

        recs.sort(Comparator.comparing(SkillRecommendation::getScore).reversed());
        return recRepo.saveAll(recs.stream().limit(10).collect(Collectors.toList()));
    }

    public void markCompleted(UUID recommendationId, UUID studentId) {
        SkillRecommendation rec = recRepo.findById(recommendationId).orElseThrow();
        if (!rec.getStudentId().equals(studentId)) throw new RuntimeException("Forbidden");
        rec.setStatus("COMPLETED");
        rec.setCompletedAt(OffsetDateTime.now());
        recRepo.save(rec);
    }

    private BigDecimal calculateGapScore(SkillGap gap) {
        return switch (gap.getGapSeverity()) {
            case "HIGH" -> new BigDecimal("90");
            case "MEDIUM" -> new BigDecimal("70");
            default -> new BigDecimal("50");
        };
    }

    private String buildGapReason(SkillGap gap) {
        return "Required level: " + gap.getRequiredLevel() + ". Current level: " + gap.getCurrentLevel() + ". " + (gap.getRecommendation() != null ? gap.getRecommendation() : "");
    }
}
