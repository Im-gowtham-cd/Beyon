package com.beyon.intelligence.service;

import com.beyon.intelligence.model.StudentSkillGraph;
import com.beyon.intelligence.model.StudentSkillIntelligence;
import com.beyon.intelligence.repository.StudentSkillGraphRepository;
import com.beyon.intelligence.repository.StudentSkillIntelligenceRepository;
import com.beyon.profile.model.Skill;
import com.beyon.profile.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SkillGraphService {

    private final StudentSkillGraphRepository graphRepo;
    private final StudentSkillIntelligenceRepository intelRepo;
    private final SkillRepository skillRepo;

    public SkillGraphService(StudentSkillGraphRepository graphRepo,
                             StudentSkillIntelligenceRepository intelRepo,
                             SkillRepository skillRepo) {
        this.graphRepo = graphRepo;
        this.intelRepo = intelRepo;
        this.skillRepo = skillRepo;
    }

    public List<Map<String, Object>> getStudentSkillGraph(UUID studentId) {
        List<StudentSkillGraph> graph = graphRepo.findByStudentIdOrderByProficiencyPctDesc(studentId);
        if (graph.isEmpty()) {
            graph = buildGraph(studentId);
        }

        return graph.stream().map(g -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", g.getId());
            m.put("skillId", g.getSkillId());
            Skill skill = skillRepo.findById(g.getSkillId()).orElse(null);
            m.put("skillName", skill != null ? skill.getName() : "Unknown");
            m.put("proficiencyPct", g.getProficiencyPct());
            m.put("level", g.getLevel());
            m.put("confidence", g.getConfidence());
            m.put("evidenceCount", g.getEvidenceCount());
            m.put("sources", g.getSources());
            m.put("improvementTrend", g.getImprovementTrend());
            m.put("verified", g.getVerified());
            return m;
        }).collect(Collectors.toList());
    }

    public List<StudentSkillGraph> buildGraph(UUID studentId) {
        List<StudentSkillIntelligence> intelList = intelRepo.findByStudentIdOrderByConfidenceScoreDesc(studentId);
        List<StudentSkillGraph> graphNodes = new ArrayList<>();

        for (StudentSkillIntelligence intel : intelList) {
            StudentSkillGraph node = graphRepo.findByStudentIdAndSkillId(studentId, intel.getSkillId())
                .orElse(new StudentSkillGraph());
            node.setStudentId(studentId);
            node.setSkillId(intel.getSkillId());
            node.setProficiencyPct(calculateProficiencyPct(intel));
            node.setLevel(intel.getProficiencyLevel());
            node.setConfidence(intel.getConfidenceScore());
            node.setEvidenceCount(intel.getEvidenceCount());
            node.setSources(buildSourcesJson(intel));
            node.setImprovementTrend(intel.getImprovementTrend());
            node.setVerified(intel.getVerified());
            node.setLastAssessedAt(intel.getLastAssessedAt());
            node.setUpdatedAt(OffsetDateTime.now());
            graphNodes.add(node);
        }

        return graphRepo.saveAll(graphNodes);
    }

    public Map<String, Object> getSkillStrengths(UUID studentId) {
        List<StudentSkillGraph> graph = graphRepo.findByStudentIdOrderByProficiencyPctDesc(studentId);
        List<Map<String, Object>> strengths = graph.stream()
            .filter(g -> levelOrder(g.getLevel()) >= 3)
            .limit(10)
            .map(g -> {
                Map<String, Object> m = new LinkedHashMap<>();
                Skill skill = skillRepo.findById(g.getSkillId()).orElse(null);
                m.put("skillName", skill != null ? skill.getName() : "Unknown");
                m.put("level", g.getLevel());
                m.put("proficiencyPct", g.getProficiencyPct());
                m.put("evidenceCount", g.getEvidenceCount());
                m.put("verified", g.getVerified());
                return m;
            })
            .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("strengths", strengths);
        result.put("totalSkills", graph.size());
        result.put("verifiedSkills", graph.stream().filter(StudentSkillGraph::getVerified).count());
        return result;
    }

    private BigDecimal calculateProficiencyPct(StudentSkillIntelligence intel) {
        BigDecimal confidence = intel.getConfidenceScore() != null ? intel.getConfidenceScore() : BigDecimal.ZERO;
        BigDecimal accuracy = intel.getAccuracy() != null ? intel.getAccuracy() : BigDecimal.ZERO;
        int evidenceBonus = Math.min(intel.getEvidenceCount() * 2, 20);
        return confidence.multiply(new BigDecimal("0.6"))
            .add(accuracy.multiply(new BigDecimal("0.4")))
            .add(BigDecimal.valueOf(evidenceBonus))
            .min(BigDecimal.valueOf(100));
    }

    private String buildSourcesJson(StudentSkillIntelligence intel) {
        List<String> sources = new ArrayList<>();
        if (intel.getPracticeCount() > 0) sources.add("\"practice\"");
        if (intel.getAssessmentCount() > 0) sources.add("\"assessment\"");
        if (intel.getCertificationCount() > 0) sources.add("\"certification\"");
        if (intel.getProjectCount() > 0) sources.add("\"project\"");
        return "[" + String.join(",", sources) + "]";
    }

    private int levelOrder(String level) {
        return switch (level) {
            case "EXPERT" -> 5; case "ADVANCED" -> 4; case "INTERMEDIATE" -> 3;
            case "ELEMENTARY" -> 2; case "BEGINNER" -> 1; default -> 0;
        };
    }
}
