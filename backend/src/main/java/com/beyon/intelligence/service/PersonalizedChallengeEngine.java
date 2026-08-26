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
public class PersonalizedChallengeEngine {

    private final PersonalizedChallengeConfigRepository configRepo;
    private final StudentSkillGraphRepository graphRepo;
    private final ChallengeSelectionLogRepository selectionLogRepo;
    private final CareerPathSkillRepository pathSkillRepo;
    private final SkillRepository skillRepo;

    public PersonalizedChallengeEngine(PersonalizedChallengeConfigRepository configRepo,
                                        StudentSkillGraphRepository graphRepo,
                                        ChallengeSelectionLogRepository selectionLogRepo,
                                        CareerPathSkillRepository pathSkillRepo,
                                        SkillRepository skillRepo) {
        this.configRepo = configRepo;
        this.graphRepo = graphRepo;
        this.selectionLogRepo = selectionLogRepo;
        this.pathSkillRepo = pathSkillRepo;
        this.skillRepo = skillRepo;
    }

    public PersonalizedChallengeConfig getConfigOrCreate(UUID studentId) {
        return configRepo.findByStudentId(studentId).orElseGet(() -> {
            PersonalizedChallengeConfig config = new PersonalizedChallengeConfig();
            config.setStudentId(studentId);
            return configRepo.save(config);
        });
    }

    public PersonalizedChallengeConfig updateConfig(UUID studentId, PersonalizedChallengeConfig updates) {
        PersonalizedChallengeConfig config = getConfigOrCreate(studentId);
        if (updates.getTargetCareerPathId() != null) config.setTargetCareerPathId(updates.getTargetCareerPathId());
        if (updates.getDifficultyWeight() != null) config.setDifficultyWeight(updates.getDifficultyWeight());
        if (updates.getGapWeight() != null) config.setGapWeight(updates.getGapWeight());
        if (updates.getStreakWeight() != null) config.setStreakWeight(updates.getStreakWeight());
        if (updates.getVarietyWeight() != null) config.setVarietyWeight(updates.getVarietyWeight());
        if (updates.getPreferredTopics() != null) config.setPreferredTopics(updates.getPreferredTopics());
        if (updates.getAvoidTopics() != null) config.setAvoidTopics(updates.getAvoidTopics());
        return configRepo.save(config);
    }

    public Map<String, Object> getRecommendation(UUID studentId) {
        PersonalizedChallengeConfig config = getConfigOrCreate(studentId);
        List<StudentSkillGraph> graph = graphRepo.findByStudentIdOrderByProficiencyPctDesc(studentId);
        List<ChallengeSelectionLog> recentSelections = selectionLogRepo.findTop50ByStudentIdOrderBySelectedAtDesc(studentId);

        // Find weakest skills for gap-based selection
        List<StudentSkillGraph> weakSkills = graph.stream()
            .sorted(Comparator.comparing(StudentSkillGraph::getProficiencyPct))
            .limit(5)
            .collect(Collectors.toList());

        // Find recently practiced to avoid repetition
        Set<UUID> recentSkillIds = recentSelections.stream()
            .filter(l -> l.getSkillId() != null)
            .map(ChallengeSelectionLog::getSkillId)
            .collect(Collectors.toSet());

        List<Map<String, Object>> recommendations = new ArrayList<>();

        // Priority 1: Gap-based recommendations (weight 0.4)
        for (StudentSkillGraph weak : weakSkills) {
            Map<String, Object> rec = new LinkedHashMap<>();
            Skill skill = skillRepo.findById(weak.getSkillId()).orElse(null);
            rec.put("skillId", weak.getSkillId());
            rec.put("skillName", skill != null ? skill.getName() : "Unknown");
            rec.put("reason", "skill_gap");
            rec.put("priority", "HIGH");
            rec.put("currentLevel", weak.getLevel());
            rec.put("proficiencyPct", weak.getProficiencyPct());
            rec.put("suggestedAction", "Practice " + (skill != null ? skill.getName() : "this skill") + " questions");
            recommendations.add(rec);
        }

        // Priority 2: Career-path aligned recommendations
        if (config.getTargetCareerPathId() != null) {
            List<CareerPathSkill> careerSkills = pathSkillRepo.findByCareerPathIdOrderBySortOrder(config.getTargetCareerPathId());
            for (CareerPathSkill cs : careerSkills) {
                Optional<StudentSkillGraph> existing = graph.stream()
                    .filter(g -> g.getSkillId().equals(cs.getSkillId()))
                    .findFirst();
                if (existing.isEmpty() || levelOrder(existing.get().getLevel()) < levelOrder(cs.getProficiencyLevel())) {
                    Skill skill = skillRepo.findById(cs.getSkillId()).orElse(null);
                    Map<String, Object> rec = new LinkedHashMap<>();
                    rec.put("skillId", cs.getSkillId());
                    rec.put("skillName", skill != null ? skill.getName() : "Unknown");
                    rec.put("reason", "career_goal");
                    rec.put("priority", "MEDIUM");
                    rec.put("requiredLevel", cs.getProficiencyLevel());
                    rec.put("currentLevel", existing.map(StudentSkillGraph::getLevel).orElse("NONE"));
                    rec.put("suggestedAction", "Work toward " + cs.getProficiencyLevel() + " in " + (skill != null ? skill.getName() : "this skill"));
                    recommendations.add(rec);
                }
            }
        }

        // Deduplicate
        List<Map<String, Object>> deduped = recommendations.stream()
            .collect(Collectors.toMap(
                m -> m.get("skillId").toString(),
                m -> m,
                (m1, m2) -> m1
            ))
            .values().stream()
            .limit(10)
            .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("recommendations", deduped);
        result.put("config", config);
        result.put("graphSize", graph.size());
        result.put("weakSkillsCount", weakSkills.size());
        return result;
    }

    public void logSelection(UUID studentId, UUID questionId, UUID skillId, String reason) {
        ChallengeSelectionLog log = new ChallengeSelectionLog();
        log.setStudentId(studentId);
        log.setQuestionId(questionId);
        log.setSkillId(skillId);
        log.setSelectionReason(reason);
        selectionLogRepo.save(log);
    }

    private int levelOrder(String level) {
        return switch (level) {
            case "EXPERT" -> 5; case "ADVANCED" -> 4; case "INTERMEDIATE" -> 3;
            case "ELEMENTARY" -> 2; case "BEGINNER" -> 1; default -> 0;
        };
    }
}
