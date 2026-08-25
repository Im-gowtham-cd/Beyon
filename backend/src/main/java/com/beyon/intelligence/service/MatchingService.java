package com.beyon.intelligence.service;

import com.beyon.intelligence.model.*;
import com.beyon.intelligence.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class MatchingService {

    private final MatchingScoreRepository matchingRepo;
    private final StudentSkillIntelligenceRepository skillIntelRepo;
    private final CareerPathRepository careerPathRepo;
    private final CareerPathSkillRepository careerPathSkillRepo;

    public MatchingService(MatchingScoreRepository matchingRepo, StudentSkillIntelligenceRepository skillIntelRepo,
                           CareerPathRepository careerPathRepo, CareerPathSkillRepository careerPathSkillRepo) {
        this.matchingRepo = matchingRepo;
        this.skillIntelRepo = skillIntelRepo;
        this.careerPathRepo = careerPathRepo;
        this.careerPathSkillRepo = careerPathSkillRepo;
    }

    public MatchingScore calculateMatch(UUID studentId, UUID opportunityId, List<UUID> requiredSkillIds, BigDecimal minCgpa, String requiredDepartment) {
        List<StudentSkillIntelligence> studentSkills = skillIntelRepo.findByStudentIdOrderByConfidenceScoreDesc(studentId);

        BigDecimal skillScore = calculateSkillScore(studentSkills, requiredSkillIds);
        BigDecimal academicScore = calculateAcademicScore(minCgpa);
        BigDecimal assessmentScore = calculateAssessmentScore(studentSkills);
        BigDecimal experienceScore = calculateExperienceScore(studentSkills);

        BigDecimal totalScore = skillScore.multiply(new BigDecimal("0.35"))
            .add(academicScore.multiply(new BigDecimal("0.15")))
            .add(assessmentScore.multiply(new BigDecimal("0.30")))
            .add(experienceScore.multiply(new BigDecimal("0.20")))
            .setScale(2, RoundingMode.HALF_UP);

        List<Map<String, Object>> factors = new ArrayList<>();
        for (UUID skillId : requiredSkillIds) {
            Optional<StudentSkillIntelligence> match = studentSkills.stream()
                .filter(s -> s.getSkillId().equals(skillId)).findFirst();
            Map<String, Object> factor = new HashMap<>();
            factor.put("skillId", skillId.toString());
            factor.put("required", true);
            factor.put("met", match.isPresent() && !match.get().getProficiencyLevel().equals("BEGINNER"));
            factor.put("level", match.map(StudentSkillIntelligence::getProficiencyLevel).orElse("NONE"));
            factors.add(factor);
        }

        MatchingScore ms = new MatchingScore();
        ms.setStudentId(studentId);
        ms.setOpportunityId(opportunityId);
        ms.setTotalScore(totalScore);
        ms.setSkillScore(skillScore);
        ms.setAcademicScore(academicScore);
        ms.setAssessmentScore(assessmentScore);
        ms.setExperienceScore(experienceScore);
        ms.setMatchFactors(mapToJson(factors));
        return matchingRepo.save(ms);
    }

    public List<Map<String, Object>> getRankedCandidates(UUID opportunityId) {
        List<MatchingScore> scores = matchingRepo.findByOpportunityIdOrderByTotalScoreDesc(opportunityId);
        return scores.stream().map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("studentId", s.getStudentId().toString());
            m.put("totalScore", s.getTotalScore());
            m.put("skillScore", s.getSkillScore());
            m.put("academicScore", s.getAcademicScore());
            m.put("assessmentScore", s.getAssessmentScore());
            m.put("experienceScore", s.getExperienceScore());
            m.put("matchFactors", s.getMatchFactors());
            return m;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getCareerReadiness(UUID studentId, UUID careerPathId) {
        List<CareerPathSkill> required = careerPathSkillRepo.findByCareerPathIdAndRequiredTrue(careerPathId);
        List<StudentSkillIntelligence> studentSkills = skillIntelRepo.findByStudentIdOrderByConfidenceScoreDesc(studentId);
        Map<UUID, StudentSkillIntelligence> skillMap = studentSkills.stream()
            .collect(Collectors.toMap(StudentSkillIntelligence::getSkillId, s -> s, (a, b) -> a));

        int acquired = 0;
        List<Map<String, Object>> gaps = new ArrayList<>();
        List<Map<String, Object>> strengths = new ArrayList<>();

        for (CareerPathSkill cps : required) {
            StudentSkillIntelligence intel = skillMap.get(cps.getSkillId());
            if (intel != null && levelOrder(intel.getProficiencyLevel()) >= levelOrder(cps.getProficiencyLevel())) {
                acquired++;
                Map<String, Object> str = new HashMap<>();
                str.put("skillId", cps.getSkillId().toString());
                str.put("level", intel.getProficiencyLevel());
                strengths.add(str);
            } else {
                Map<String, Object> gap = new HashMap<>();
                gap.put("skillId", cps.getSkillId().toString());
                gap.put("currentLevel", intel != null ? intel.getProficiencyLevel() : "NONE");
                gap.put("requiredLevel", cps.getProficiencyLevel());
                gaps.add(gap);
            }
        }

        BigDecimal readiness = required.isEmpty() ? BigDecimal.ZERO
            : BigDecimal.valueOf(acquired).multiply(new BigDecimal("100"))
                .divide(BigDecimal.valueOf(required.size()), 1, RoundingMode.HALF_UP);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("readinessScore", readiness);
        result.put("skillsAcquired", acquired);
        result.put("skillsTotal", required.size());
        result.put("strengths", strengths);
        result.put("gaps", gaps);
        return result;
    }

    public List<Map<String, Object>> analyzeSkillGaps(UUID studentId, UUID careerPathId) {
        List<CareerPathSkill> required = careerPathSkillRepo.findByCareerPathIdOrderBySortOrder(careerPathId);
        List<StudentSkillIntelligence> studentSkills = skillIntelRepo.findByStudentIdOrderByConfidenceScoreDesc(studentId);
        Map<UUID, StudentSkillIntelligence> skillMap = studentSkills.stream()
            .collect(Collectors.toMap(StudentSkillIntelligence::getSkillId, s -> s, (a, b) -> a));

        List<Map<String, Object>> gaps = new ArrayList<>();
        for (CareerPathSkill cps : required) {
            StudentSkillIntelligence intel = skillMap.get(cps.getSkillId());
            String currentLevel = intel != null ? intel.getProficiencyLevel() : "NONE";
            int current = levelOrder(currentLevel);
            int required2 = levelOrder(cps.getProficiencyLevel());
            String severity = current >= required2 ? "NONE" : (required2 - current >= 3 ? "CRITICAL" : required2 - current >= 2 ? "HIGH" : "MEDIUM");

            Map<String, Object> gap = new HashMap<>();
            gap.put("skillId", cps.getSkillId().toString());
            gap.put("requiredLevel", cps.getProficiencyLevel());
            gap.put("currentLevel", currentLevel);
            gap.put("gapSeverity", severity);
            gap.put("estimatedEffortHours", estimateHours(current, required2));
            gaps.add(gap);
        }
        return gaps;
    }

    private BigDecimal calculateSkillScore(List<StudentSkillIntelligence> studentSkills, List<UUID> requiredSkillIds) {
        if (requiredSkillIds.isEmpty()) return new BigDecimal("50");
        int matched = 0;
        for (UUID skillId : requiredSkillIds) {
            Optional<StudentSkillIntelligence> found = studentSkills.stream().filter(s -> s.getSkillId().equals(skillId)).findFirst();
            if (found.isPresent() && levelOrder(found.get().getProficiencyLevel()) >= 2) matched++;
        }
        return BigDecimal.valueOf(matched).multiply(new BigDecimal("100"))
            .divide(BigDecimal.valueOf(requiredSkillIds.size()), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateAcademicScore(BigDecimal minCgpa) {
        return minCgpa != null ? minCgpa.multiply(new BigDecimal("10")).setScale(2, RoundingMode.HALF_UP) : new BigDecimal("50");
    }

    private BigDecimal calculateAssessmentScore(List<StudentSkillIntelligence> studentSkills) {
        if (studentSkills.isEmpty()) return BigDecimal.ZERO;
        return studentSkills.stream().map(StudentSkillIntelligence::getConfidenceScore)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .divide(BigDecimal.valueOf(studentSkills.size()), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateExperienceScore(List<StudentSkillIntelligence> studentSkills) {
        long totalEvidence = studentSkills.stream().mapToLong(StudentSkillIntelligence::getEvidenceCount).sum();
        return BigDecimal.valueOf(Math.min(100, totalEvidence * 5)).setScale(2, RoundingMode.HALF_UP);
    }

    private int levelOrder(String level) {
        return switch (level) {
            case "EXPERT" -> 5; case "ADVANCED" -> 4; case "INTERMEDIATE" -> 3;
            case "ELEMENTARY" -> 2; case "BEGINNER" -> 1; default -> 0;
        };
    }

    private int estimateHours(int current, int target) {
        return (target - current) * 20;
    }

    private String mapToJson(List<Map<String, Object>> list) {
        StringBuilder sb = new StringBuilder("[");
        boolean first = true;
        for (Map<String, Object> item : list) {
            if (!first) sb.append(",");
            sb.append("{");
            boolean f2 = true;
            for (Map.Entry<String, Object> e : item.entrySet()) {
                if (!f2) sb.append(",");
                sb.append("\"").append(e.getKey()).append("\":");
                if (e.getValue() instanceof Number) sb.append(e.getValue());
                else sb.append("\"").append(e.getValue()).append("\"");
                f2 = false;
            }
            sb.append("}");
            first = false;
        }
        sb.append("]");
        return sb.toString();
    }
}
