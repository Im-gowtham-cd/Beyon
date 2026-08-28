package com.beyon.community.service;

import com.beyon.community.model.ProjectEvaluation;
import com.beyon.community.repository.ProjectEvaluationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@Transactional
public class ProjectEvaluationService {

    private final ProjectEvaluationRepository evalRepo;

    public ProjectEvaluationService(ProjectEvaluationRepository evalRepo) {
        this.evalRepo = evalRepo;
    }

    public ProjectEvaluation submitEvaluation(ProjectEvaluation eval) {
        // Calculate overall score
        int total = eval.getTechnicalQuality() + eval.getInnovation() + eval.getCodeQuality()
            + eval.getDocumentation() + eval.getPresentation() + eval.getProblemSolving() + eval.getTeamwork();
        eval.setOverallScore(BigDecimal.valueOf(total / 7.0).setScale(2, RoundingMode.HALF_UP));
        return evalRepo.save(eval);
    }

    public List<ProjectEvaluation> getProjectEvaluations(UUID projectId) {
        return evalRepo.findByProjectIdOrderByCreatedAtDesc(projectId);
    }

    public List<ProjectEvaluation> getTeamEvaluations(UUID teamId) {
        return evalRepo.findByTeamIdOrderByCreatedAtDesc(teamId);
    }

    public Map<String, Object> getEvaluationSummary(UUID projectId) {
        List<ProjectEvaluation> evals = evalRepo.findByProjectIdOrderByCreatedAtDesc(projectId);
        if (evals.isEmpty()) return Map.of("count", 0, "averageScore", BigDecimal.ZERO);

        BigDecimal avgScore = evals.stream()
            .map(ProjectEvaluation::getOverallScore)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .divide(BigDecimal.valueOf(evals.size()), 2, RoundingMode.HALF_UP);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("count", evals.size());
        result.put("averageScore", avgScore);
        result.put("evaluations", evals);
        return result;
    }
}
