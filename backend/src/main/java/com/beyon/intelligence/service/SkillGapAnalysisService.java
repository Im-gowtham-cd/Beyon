package com.beyon.intelligence.service;

import com.beyon.intelligence.model.*;
import com.beyon.intelligence.repository.*;
import com.beyon.profile.model.Skill;
import com.beyon.profile.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SkillGapAnalysisService {

    private final CareerPathRepository careerPathRepo;
    private final CareerPathSkillRepository pathSkillRepo;
    private final StudentSkillGraphRepository graphRepo;
    private final SkillRepository skillRepo;

    public SkillGapAnalysisService(CareerPathRepository careerPathRepo,
                                    CareerPathSkillRepository pathSkillRepo,
                                    StudentSkillGraphRepository graphRepo,
                                    SkillRepository skillRepo) {
        this.careerPathRepo = careerPathRepo;
        this.pathSkillRepo = pathSkillRepo;
        this.graphRepo = graphRepo;
        this.skillRepo = skillRepo;
    }

    public Map<String, Object> analyze(UUID studentId, UUID careerPathId) {
        CareerPath path = careerPathRepo.findById(careerPathId)
            .orElseThrow(() -> new RuntimeException("Career path not found"));
        List<CareerPathSkill> requiredSkills = pathSkillRepo.findByCareerPathIdOrderBySortOrder(careerPathId);
        List<StudentSkillGraph> studentGraph = graphRepo.findByStudentIdOrderByProficiencyPctDesc(studentId);
        Map<UUID, StudentSkillGraph> skillMap = new HashMap<>();
        studentGraph.forEach(s -> skillMap.put(s.getSkillId(), s));

        List<Map<String, Object>> gaps = new ArrayList<>();
        int acquired = 0;
        int total = requiredSkills.size();

        for (CareerPathSkill req : requiredSkills) {
            StudentSkillGraph studentSkill = skillMap.get(req.getSkillId());
            Skill skill = skillRepo.findById(req.getSkillId()).orElse(null);
            String skillName = skill != null ? skill.getName() : "Unknown";

            String currentLevel = studentSkill != null ? studentSkill.getLevel() : "NONE";
            int currentOrder = levelOrder(currentLevel);
            int requiredOrder = levelOrder(req.getProficiencyLevel());
            boolean hasGap = currentOrder < requiredOrder;

            Map<String, Object> gap = new LinkedHashMap<>();
            gap.put("skillId", req.getSkillId());
            gap.put("skillName", skillName);
            gap.put("requiredLevel", req.getProficiencyLevel());
            gap.put("currentLevel", currentLevel);
            gap.put("required", req.getRequired());
            gap.put("hasGap", hasGap);

            if (!hasGap) {
                acquired++;
                gap.put("status", "STRONG");
                gap.put("proficiencyPct", studentSkill != null ? studentSkill.getProficiencyPct() : BigDecimal.ZERO);
            } else if (currentOrder == 0) {
                gap.put("status", "CRITICAL");
                gap.put("proficiencyPct", BigDecimal.ZERO);
                gap.put("estimatedHours", 40);
            } else {
                gap.put("status", "NEEDS_IMPROVEMENT");
                gap.put("proficiencyPct", studentSkill != null ? studentSkill.getProficiencyPct() : BigDecimal.ZERO);
                gap.put("estimatedHours", (requiredOrder - currentOrder) * 15);
            }
            gaps.add(gap);
        }

        gaps.sort((a, b) -> {
            String sa = (String) a.get("status");
            String sb = (String) b.get("status");
            return statusOrder(sa) - statusOrder(sb);
        });

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("careerPath", path);
        result.put("totalSkills", total);
        result.put("acquiredSkills", acquired);
        result.put("readinessScore", total > 0 ? (acquired * 100 / total) : 0);
        result.put("skills", gaps);
        result.put("strongSkills", gaps.stream().filter(g -> "STRONG".equals(g.get("status"))).collect(Collectors.toList()));
        result.put("improvementNeeded", gaps.stream().filter(g -> "NEEDS_IMPROVEMENT".equals(g.get("status"))).collect(Collectors.toList()));
        result.put("criticalGaps", gaps.stream().filter(g -> "CRITICAL".equals(g.get("status"))).collect(Collectors.toList()));
        return result;
    }

    public Map<String, Object> getTopGaps(UUID studentId, int limit) {
        List<StudentSkillGraph> graph = graphRepo.findByStudentIdOrderByProficiencyPctDesc(studentId);
        List<Map<String, Object>> weakest = graph.stream()
            .sorted(Comparator.comparing(StudentSkillGraph::getProficiencyPct))
            .limit(limit)
            .map(g -> {
                Map<String, Object> m = new LinkedHashMap<>();
                Skill skill = skillRepo.findById(g.getSkillId()).orElse(null);
                m.put("skillName", skill != null ? skill.getName() : "Unknown");
                m.put("level", g.getLevel());
                m.put("proficiencyPct", g.getProficiencyPct());
                m.put("trend", g.getImprovementTrend());
                return m;
            })
            .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("weakestSkills", weakest);
        result.put("totalSkillsGraphed", graph.size());
        return result;
    }

    private int levelOrder(String level) {
        return switch (level) {
            case "EXPERT" -> 5; case "ADVANCED" -> 4; case "INTERMEDIATE" -> 3;
            case "ELEMENTARY" -> 2; case "BEGINNER" -> 1; default -> 0;
        };
    }

    private int statusOrder(String status) {
        return switch (status) {
            case "CRITICAL" -> 0; case "NEEDS_IMPROVEMENT" -> 1; default -> 2;
        };
    }
}
