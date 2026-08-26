package com.beyon.intelligence.service;

import com.beyon.intelligence.model.CareerPath;
import com.beyon.intelligence.model.CareerPathSkill;
import com.beyon.intelligence.model.CareerRoadmapItem;
import com.beyon.intelligence.model.StudentCareerProgress;
import com.beyon.intelligence.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CareerRoadmapService {
    private final CareerRoadmapItemRepository roadmapRepo;
    private final CareerPathRepository careerPathRepo;
    private final CareerPathSkillRepository pathSkillRepo;
    private final StudentCareerProgressRepository progressRepo;
    private final StudentSkillIntelligenceRepository skillIntelRepo;

    public CareerRoadmapService(CareerRoadmapItemRepository roadmapRepo, CareerPathRepository careerPathRepo,
                                 CareerPathSkillRepository pathSkillRepo, StudentCareerProgressRepository progressRepo,
                                 StudentSkillIntelligenceRepository skillIntelRepo) {
        this.roadmapRepo = roadmapRepo;
        this.careerPathRepo = careerPathRepo;
        this.pathSkillRepo = pathSkillRepo;
        this.progressRepo = progressRepo;
        this.skillIntelRepo = skillIntelRepo;
    }

    public List<CareerRoadmapItem> getRoadmap(UUID studentId, UUID careerPathId) {
        return roadmapRepo.findByStudentIdAndCareerPathIdOrderBySortOrder(studentId, careerPathId);
    }

    public List<CareerRoadmapItem> generateRoadmap(UUID studentId, UUID careerPathId) {
        roadmapRepo.deleteAll(roadmapRepo.findByStudentIdAndCareerPathIdOrderBySortOrder(studentId, careerPathId));

        List<CareerPathSkill> pathSkills = pathSkillRepo.findByCareerPathIdOrderBySortOrder(careerPathId);
        Set<String> acquiredSkills = skillIntelRepo.findByStudentIdOrderByConfidenceScoreDesc(studentId)
            .stream().map(s -> s.getSkillId().toString()).collect(Collectors.toSet());

        List<CareerRoadmapItem> items = new ArrayList<>();
        for (int i = 0; i < pathSkills.size(); i++) {
            CareerPathSkill ps = pathSkills.get(i);
            CareerRoadmapItem item = new CareerRoadmapItem();
            item.setStudentId(studentId);
            item.setCareerPathId(careerPathId);
            item.setSkillName("Skill " + ps.getSkillId().toString().substring(0, 8));
            item.setSortOrder(i);

            boolean acquired = acquiredSkills.contains(ps.getSkillId().toString());
            if (acquired) {
                item.setState("COMPLETED");
                item.setProgress(BigDecimal.valueOf(100));
                item.setCompletedAt(OffsetDateTime.now());
            } else if (i == 0 || items.get(i - 1).getState().equals("COMPLETED")) {
                item.setState("AVAILABLE");
            } else {
                item.setState("LOCKED");
            }
            item.setRequiredCoins("ADVANCED".equals(ps.getProficiencyLevel()) ? 200 : 100);
            items.add(item);
        }
        return roadmapRepo.saveAll(items);
    }

    public CareerRoadmapItem startItem(UUID itemId, UUID studentId) {
        CareerRoadmapItem item = roadmapRepo.findById(itemId).orElseThrow();
        if (!item.getStudentId().equals(studentId)) throw new RuntimeException("Forbidden");
        if (!"AVAILABLE".equals(item.getState())) throw new RuntimeException("Item not available");
        item.setState("IN_PROGRESS");
        item.setUpdatedAt(OffsetDateTime.now());
        return roadmapRepo.save(item);
    }

    public CareerRoadmapItem completeItem(UUID itemId, UUID studentId) {
        CareerRoadmapItem item = roadmapRepo.findById(itemId).orElseThrow();
        if (!item.getStudentId().equals(studentId)) throw new RuntimeException("Forbidden");
        item.setState("COMPLETED");
        item.setProgress(BigDecimal.valueOf(100));
        item.setCompletedAt(OffsetDateTime.now());
        item.setUpdatedAt(OffsetDateTime.now());

        unlockNext(item.getStudentId(), item.getCareerPathId(), item.getSortOrder());
        return roadmapRepo.save(item);
    }

    private void unlockNext(UUID studentId, UUID careerPathId, int currentOrder) {
        List<CareerRoadmapItem> items = roadmapRepo.findByStudentIdAndCareerPathIdOrderBySortOrder(studentId, careerPathId);
        for (CareerRoadmapItem item : items) {
            if (item.getSortOrder() == currentOrder + 1 && "LOCKED".equals(item.getState())) {
                item.setState("AVAILABLE");
                item.setUnlockedAt(OffsetDateTime.now());
                item.setUpdatedAt(OffsetDateTime.now());
                roadmapRepo.save(item);
                break;
            }
        }
    }
}
