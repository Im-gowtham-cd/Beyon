package com.beyon.intelligence.service;

import com.beyon.intelligence.model.*;
import com.beyon.intelligence.repository.*;
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
public class AdaptiveLearningService {

    private final AdaptiveLearningPathRepository pathRepo;
    private final AdaptiveLearningStepRepository stepRepo;
    private final CareerPathRepository careerPathRepo;
    private final CareerPathSkillRepository pathSkillRepo;
    private final StudentSkillGraphRepository graphRepo;
    private final SkillRepository skillRepo;

    public AdaptiveLearningService(AdaptiveLearningPathRepository pathRepo,
                                    AdaptiveLearningStepRepository stepRepo,
                                    CareerPathRepository careerPathRepo,
                                    CareerPathSkillRepository pathSkillRepo,
                                    StudentSkillGraphRepository graphRepo,
                                    SkillRepository skillRepo) {
        this.pathRepo = pathRepo;
        this.stepRepo = stepRepo;
        this.careerPathRepo = careerPathRepo;
        this.pathSkillRepo = pathSkillRepo;
        this.graphRepo = graphRepo;
        this.skillRepo = skillRepo;
    }

    public Map<String, Object> getOrCreatePath(UUID studentId, UUID careerPathId) {
        Optional<AdaptiveLearningPath> existing = pathRepo.findByStudentIdAndCareerPathIdAndStatus(studentId, careerPathId, "ACTIVE");
        if (existing.isPresent()) {
            return buildPathResponse(existing.get());
        }

        CareerPath careerPath = careerPathRepo.findById(careerPathId)
            .orElseThrow(() -> new RuntimeException("Career path not found"));
        List<CareerPathSkill> requiredSkills = pathSkillRepo.findByCareerPathIdOrderBySortOrder(careerPathId);
        List<StudentSkillGraph> studentGraph = graphRepo.findByStudentIdOrderByProficiencyPctDesc(studentId);
        Map<UUID, StudentSkillGraph> skillMap = new HashMap<>();
        studentGraph.forEach(s -> skillMap.put(s.getSkillId(), s));

        AdaptiveLearningPath path = new AdaptiveLearningPath();
        path.setStudentId(studentId);
        path.setCareerPathId(careerPathId);
        path = pathRepo.save(path);

        List<AdaptiveLearningStep> steps = new ArrayList<>();
        int order = 0;

        for (CareerPathSkill req : requiredSkills) {
            AdaptiveLearningStep step = new AdaptiveLearningStep();
            step.setPathId(path.getId());
            step.setStepOrder(order++);
            step.setSkillId(req.getSkillId());
            Skill skill = skillRepo.findById(req.getSkillId()).orElse(null);
            step.setSkillName(skill != null ? skill.getName() : "Skill");
            step.setConcept(req.getProficiencyLevel() + " level proficiency in " + (skill != null ? skill.getName() : "this skill"));

            StudentSkillGraph sg = skillMap.get(req.getSkillId());
            if (sg != null && levelOrder(sg.getLevel()) >= levelOrder(req.getProficiencyLevel())) {
                step.setState("COMPLETED");
                step.setProgress(BigDecimal.valueOf(100));
                step.setCompletedAt(OffsetDateTime.now());
            } else if (steps.isEmpty() || steps.get(steps.size() - 1).getState().equals("COMPLETED")) {
                step.setState("IN_PROGRESS");
                step.setStartedAt(OffsetDateTime.now());
            } else {
                step.setState("LOCKED");
            }
            steps.add(step);
        }

        stepRepo.saveAll(steps);

        long completedCount = steps.stream().filter(s -> "COMPLETED".equals(s.getState())).count();
        path.setCurrentStepIndex((int) completedCount);
        path.setOverallProgress(BigDecimal.valueOf(completedCount * 100 / Math.max(1, steps.size())));
        pathRepo.save(path);

        return buildPathResponse(path);
    }

    public AdaptiveLearningStep completeStep(UUID stepId, UUID studentId) {
        AdaptiveLearningStep step = stepRepo.findById(stepId)
            .orElseThrow(() -> new RuntimeException("Step not found"));
        if (!"IN_PROGRESS".equals(step.getState())) throw new RuntimeException("Step not in progress");

        step.setState("COMPLETED");
        step.setProgress(BigDecimal.valueOf(100));
        step.setCompletedAt(OffsetDateTime.now());
        step.setUpdatedAt(OffsetDateTime.now());

        // Unlock next step
        List<AdaptiveLearningStep> steps = stepRepo.findByPathIdOrderByStepOrder(step.getPathId());
        for (AdaptiveLearningStep s : steps) {
            if (s.getStepOrder() == step.getStepOrder() + 1 && "LOCKED".equals(s.getState())) {
                s.setState("IN_PROGRESS");
                s.setStartedAt(OffsetDateTime.now());
                s.setUpdatedAt(OffsetDateTime.now());
                stepRepo.save(s);
                break;
            }
        }

        // Update path progress
        AdaptiveLearningPath path = pathRepo.findById(step.getPathId()).orElse(null);
        if (path != null) {
            long completed = steps.stream().filter(s -> "COMPLETED".equals(s.getState())).count();
            path.setCurrentStepIndex((int) completed);
            path.setOverallProgress(BigDecimal.valueOf(completed * 100 / Math.max(1, steps.size())));
            if (completed == steps.size()) {
                path.setStatus("COMPLETED");
                path.setCompletedAt(OffsetDateTime.now());
            }
            path.setUpdatedAt(OffsetDateTime.now());
            pathRepo.save(path);
        }

        return stepRepo.save(step);
    }

    public List<AdaptiveLearningPath> getMyPaths(UUID studentId) {
        return pathRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    private Map<String, Object> buildPathResponse(AdaptiveLearningPath path) {
        CareerPath careerPath = careerPathRepo.findById(path.getCareerPathId()).orElse(null);
        List<AdaptiveLearningStep> steps = stepRepo.findByPathIdOrderByStepOrder(path.getId());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("path", path);
        result.put("careerPathName", careerPath != null ? careerPath.getName() : "Unknown");
        result.put("steps", steps.stream().map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", s.getId());
            m.put("stepOrder", s.getStepOrder());
            m.put("skillName", s.getSkillName());
            m.put("concept", s.getConcept());
            m.put("state", s.getState());
            m.put("progress", s.getProgress());
            m.put("learningResources", s.getLearningResources());
            return m;
        }).collect(Collectors.toList()));
        result.put("completedSteps", steps.stream().filter(s -> "COMPLETED".equals(s.getState())).count());
        result.put("totalSteps", steps.size());
        return result;
    }

    private int levelOrder(String level) {
        return switch (level) {
            case "EXPERT" -> 5; case "ADVANCED" -> 4; case "INTERMEDIATE" -> 3;
            case "ELEMENTARY" -> 2; case "BEGINNER" -> 1; default -> 0;
        };
    }
}
