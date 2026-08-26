package com.beyon.recruitment.service;

import com.beyon.recruitment.model.CareerOutcome;
import com.beyon.recruitment.repository.CareerOutcomeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class CareerOutcomeService {

    private final CareerOutcomeRepository outcomeRepo;

    public CareerOutcomeService(CareerOutcomeRepository outcomeRepo) {
        this.outcomeRepo = outcomeRepo;
    }

    public CareerOutcome createOutcome(UUID studentId, CareerOutcome outcome) {
        outcome.setStudentId(studentId);
        return outcomeRepo.save(outcome);
    }

    public List<CareerOutcome> getMyOutcomes(UUID studentId) {
        return outcomeRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public Map<String, Object> getOutcomeTimeline(UUID studentId) {
        List<CareerOutcome> outcomes = outcomeRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("outcomes", outcomes);
        result.put("total", outcomes.size());
        result.put("currentRole", outcomes.stream().filter(CareerOutcome::getIsCurrent).findFirst().orElse(null));
        return result;
    }

    public CareerOutcome updateOutcome(UUID outcomeId, UUID studentId, CareerOutcome updates) {
        CareerOutcome outcome = outcomeRepo.findById(outcomeId)
            .orElseThrow(() -> new RuntimeException("Outcome not found"));
        if (!outcome.getStudentId().equals(studentId)) throw new RuntimeException("Forbidden");
        if (updates.getCompanyName() != null) outcome.setCompanyName(updates.getCompanyName());
        if (updates.getRole() != null) outcome.setRole(updates.getRole());
        if (updates.getDescription() != null) outcome.setDescription(updates.getDescription());
        if (updates.getEndDate() != null) outcome.setEndDate(updates.getEndDate());
        if (updates.getIsCurrent() != null) outcome.setIsCurrent(updates.getIsCurrent());
        return outcomeRepo.save(outcome);
    }
}
