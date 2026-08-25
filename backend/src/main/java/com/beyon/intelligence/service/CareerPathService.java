package com.beyon.intelligence.service;

import com.beyon.intelligence.model.*;
import com.beyon.intelligence.repository.*;
import com.beyon.profile.model.Skill;
import com.beyon.profile.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class CareerPathService {

    private final CareerPathRepository pathRepo;
    private final CareerPathSkillRepository pathSkillRepo;
    private final StudentCareerProgressRepository progressRepo;
    private final StudentSkillIntelligenceRepository skillIntelRepo;
    private final SkillRepository skillRepo;

    public CareerPathService(CareerPathRepository pathRepo, CareerPathSkillRepository pathSkillRepo,
                             StudentCareerProgressRepository progressRepo, StudentSkillIntelligenceRepository skillIntelRepo,
                             SkillRepository skillRepo) {
        this.pathRepo = pathRepo;
        this.pathSkillRepo = pathSkillRepo;
        this.progressRepo = progressRepo;
        this.skillIntelRepo = skillIntelRepo;
        this.skillRepo = skillRepo;
    }

    public CareerPath createPath(CareerPath path) { return pathRepo.save(path); }

    public List<CareerPath> getAllPaths() { return pathRepo.findByActiveTrue(); }

    public CareerPath getBySlug(String slug) { return pathRepo.findBySlug(slug).orElseThrow(() -> new RuntimeException("Career path not found")); }

    public StudentCareerProgress startPath(UUID studentId, UUID careerPathId) {
        Optional<StudentCareerProgress> existing = progressRepo.findByStudentIdAndCareerPathId(studentId, careerPathId);
        if (existing.isPresent()) return existing.get();

        List<CareerPathSkill> skills = pathSkillRepo.findByCareerPathIdOrderBySortOrder(careerPathId);
        StudentCareerProgress progress = new StudentCareerProgress();
        progress.setStudentId(studentId);
        progress.setCareerPathId(careerPathId);
        progress.setSkillsTotal(skills.size());
        return progressRepo.save(progress);
    }

    public List<StudentCareerProgress> getMyPaths(UUID studentId) { return progressRepo.findByStudentIdOrderByLastUpdatedAtDesc(studentId); }

    public Map<String, Object> getPathDetail(UUID pathId, UUID studentId) {
        CareerPath path = pathRepo.findById(pathId).orElseThrow(() -> new RuntimeException("Career path not found"));
        List<CareerPathSkill> requiredSkills = pathSkillRepo.findByCareerPathIdOrderBySortOrder(pathId);
        List<StudentSkillIntelligence> studentSkills = skillIntelRepo.findByStudentIdOrderByConfidenceScoreDesc(studentId);
        Map<UUID, StudentSkillIntelligence> skillMap = new HashMap<>();
        studentSkills.forEach(s -> skillMap.put(s.getSkillId(), s));

        List<Map<String, Object>> skills = new ArrayList<>();
        for (CareerPathSkill cps : requiredSkills) {
            StudentSkillIntelligence intel = skillMap.get(cps.getSkillId());
            Skill skill = skillRepo.findById(cps.getSkillId()).orElse(null);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("skillId", cps.getSkillId().toString());
            m.put("skillName", skill != null ? skill.getName() : "Unknown");
            m.put("required", cps.getRequired());
            m.put("requiredLevel", cps.getProficiencyLevel());
            m.put("currentLevel", intel != null ? intel.getProficiencyLevel() : "NONE");
            m.put("acquired", intel != null && levelOrder(intel.getProficiencyLevel()) >= levelOrder(cps.getProficiencyLevel()));
            skills.add(m);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("careerPath", path);
        result.put("skills", skills);
        return result;
    }

    private int levelOrder(String level) {
        return switch (level) {
            case "EXPERT" -> 5; case "ADVANCED" -> 4; case "INTERMEDIATE" -> 3;
            case "ELEMENTARY" -> 2; case "BEGINNER" -> 1; default -> 0;
        };
    }
}
