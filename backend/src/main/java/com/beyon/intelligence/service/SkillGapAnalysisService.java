package com.beyon.intelligence.service;

import com.beyon.intelligence.model.*;
import com.beyon.intelligence.repository.*;
import com.beyon.profile.model.Skill;
import com.beyon.profile.model.StudentSkill;
import com.beyon.profile.repository.SkillRepository;
import com.beyon.profile.repository.StudentProfileRepository;
import com.beyon.profile.repository.StudentSkillRepository;
import com.beyon.intelligence.client.AiIntelligenceClient;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final AiIntelligenceClient aiClient;
    private final StudentProfileRepository profileRepo;
    private final StudentSkillRepository studentSkillRepo;

    @Autowired
    public SkillGapAnalysisService(CareerPathRepository careerPathRepo,
                                    CareerPathSkillRepository pathSkillRepo,
                                    StudentSkillGraphRepository graphRepo,
                                    SkillRepository skillRepo,
                                    @Autowired(required = false) AiIntelligenceClient aiClient,
                                    @Autowired(required = false) StudentProfileRepository profileRepo,
                                    @Autowired(required = false) StudentSkillRepository studentSkillRepo) {
        this.careerPathRepo = careerPathRepo;
        this.pathSkillRepo = pathSkillRepo;
        this.graphRepo = graphRepo;
        this.skillRepo = skillRepo;
        this.aiClient = aiClient;
        this.profileRepo = profileRepo;
        this.studentSkillRepo = studentSkillRepo;
    }

    public SkillGapAnalysisService(CareerPathRepository careerPathRepo,
                                    CareerPathSkillRepository pathSkillRepo,
                                    StudentSkillGraphRepository graphRepo,
                                    SkillRepository skillRepo) {
        this(careerPathRepo, pathSkillRepo, graphRepo, skillRepo, null, null, null);
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

    public Map<String, Object> analyzeWithAi(UUID studentId, UUID careerPathId, String customTargetProfession) {
        Map<String, Object> baseAnalysis;
        CareerPath selectedPath = null;

        if (careerPathId != null) {
            baseAnalysis = analyze(studentId, careerPathId);
            selectedPath = (CareerPath) baseAnalysis.get("careerPath");
        } else {
            List<CareerPath> paths = careerPathRepo.findByActiveTrue();
            if (customTargetProfession != null && !customTargetProfession.isBlank()) {
                String search = customTargetProfession.trim().toLowerCase();
                for (CareerPath p : paths) {
                    if (p.getName().toLowerCase().contains(search) || (p.getSlug() != null && p.getSlug().toLowerCase().contains(search))) {
                        selectedPath = p;
                        break;
                    }
                }
            }
            if (selectedPath == null && !paths.isEmpty()) {
                selectedPath = paths.get(0);
            }
            if (selectedPath != null) {
                baseAnalysis = analyze(studentId, selectedPath.getId());
            } else {
                baseAnalysis = new LinkedHashMap<>();
                baseAnalysis.put("totalSkills", 0);
                baseAnalysis.put("acquiredSkills", 0);
                baseAnalysis.put("readinessScore", 0);
                baseAnalysis.put("skills", Collections.emptyList());
                baseAnalysis.put("criticalGaps", Collections.emptyList());
            }
        }

        String targetRole = (customTargetProfession != null && !customTargetProfession.isBlank())
                ? customTargetProfession.trim()
                : (selectedPath != null ? selectedPath.getName() : "Software Engineer");

        Map<String, Object> studentSkillsMap = new LinkedHashMap<>();
        if (studentSkillRepo != null) {
            try {
                List<StudentSkill> ssList = studentSkillRepo.findByUserId(studentId);
                for (StudentSkill ss : ssList) {
                    Map<String, Object> sData = new HashMap<>();
                    sData.put("proficiency", ss.getProficiency() != null ? ss.getProficiency().name() : "BEGINNER");
                    studentSkillsMap.put(ss.getSkillName(), sData);
                }
            } catch (Exception ignored) {}
        }

        List<StudentSkillGraph> graph = graphRepo.findByStudentIdOrderByProficiencyPctDesc(studentId);
        for (StudentSkillGraph g : graph) {
            Skill s = skillRepo.findById(g.getSkillId()).orElse(null);
            String name = s != null ? s.getName() : "Skill";
            if (!studentSkillsMap.containsKey(name)) {
                Map<String, Object> sData = new HashMap<>();
                sData.put("proficiency", g.getLevel());
                sData.put("score", g.getProficiencyPct());
                studentSkillsMap.put(name, sData);
            }
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> skillsGaps = (List<Map<String, Object>>) baseAnalysis.getOrDefault("skills", Collections.emptyList());
        List<Map<String, Object>> gapsForAi = new ArrayList<>();
        for (Map<String, Object> g : skillsGaps) {
            if (Boolean.TRUE.equals(g.get("hasGap"))) {
                Map<String, Object> m = new HashMap<>();
                m.put("skill_name", g.get("skillName"));
                m.put("current_level", g.get("currentLevel"));
                m.put("required_level", g.get("requiredLevel"));
                m.put("gap", g.get("proficiencyPct") != null ? (100 - ((Number) g.get("proficiencyPct")).intValue()) : 50);
                m.put("severity", g.get("status"));
                gapsForAi.add(m);
            }
        }

        List<String> interests = new ArrayList<>();
        if (profileRepo != null) {
            try {
                profileRepo.findByUserId(studentId).ifPresent(p -> {
                    if (p.getPreferredJobRoles() != null) {
                        interests.addAll(Arrays.asList(p.getPreferredJobRoles().split(",")));
                    }
                });
            } catch (Exception ignored) {}
        }

        Map<String, Object> aiResult = Collections.emptyMap();
        if (aiClient != null) {
            aiResult = aiClient.generateAiSkillGapAnalysis(
                    studentId.toString(),
                    targetRole,
                    studentSkillsMap,
                    gapsForAi,
                    interests
            );
        }

        Map<String, Object> enriched = new LinkedHashMap<>(baseAnalysis);
        enriched.put("targetProfession", targetRole);
        enriched.put("aiAnalysis", aiResult);
        return enriched;
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

