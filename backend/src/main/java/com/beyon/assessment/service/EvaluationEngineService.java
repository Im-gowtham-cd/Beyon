package com.beyon.assessment.service;

import com.beyon.assessment.model.AssessmentResult;
import com.beyon.assessment.repository.AssessmentResultRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@Transactional
public class EvaluationEngineService {
    private final AssessmentResultRepository resultRepo;
    private final ObjectMapper mapper;

    public EvaluationEngineService(AssessmentResultRepository resultRepo, ObjectMapper mapper) {
        this.resultRepo = resultRepo;
        this.mapper = mapper;
    }

    public AssessmentResult evaluate(UUID sessionId, UUID studentId, List<Map<String, Object>> answers, BigDecimal maxScore) {
        int correct = 0;
        int attempted = answers.size();
        BigDecimal totalScore = BigDecimal.ZERO;

        for (Map<String, Object> answer : answers) {
            String userAnswer = (String) answer.get("userAnswer");
            String correctAnswer = (String) answer.get("correctAnswer");
            BigDecimal questionScore = new BigDecimal(answer.getOrDefault("score", "1").toString());

            if (userAnswer != null && userAnswer.equalsIgnoreCase(correctAnswer)) {
                correct++;
                totalScore = totalScore.add(questionScore);
            }
        }

        BigDecimal accuracy = attempted > 0
            ? BigDecimal.valueOf(correct).divide(BigDecimal.valueOf(attempted), 2, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
            : BigDecimal.ZERO;

        BigDecimal overallScore = maxScore != null && maxScore.compareTo(BigDecimal.ZERO) > 0
            ? totalScore.divide(maxScore, 2, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
            : totalScore;

        AssessmentResult result = new AssessmentResult();
        result.setSessionId(sessionId);
        result.setStudentId(studentId);
        result.setOverallScore(overallScore);
        result.setMaxScore(maxScore != null ? maxScore : totalScore);
        result.setAccuracy(accuracy);
        result.setQuestionsAttempted(attempted);
        result.setQuestionsCorrect(correct);
        result.setStatus("COMPLETED");

        return resultRepo.save(result);
    }

    public AssessmentResult getResultBySession(UUID sessionId) {
        return resultRepo.findBySessionId(sessionId).orElse(null);
    }

    public List<AssessmentResult> getStudentResults(UUID studentId) {
        return resultRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public Map<String, Object> getResultReport(UUID sessionId) {
        AssessmentResult result = resultRepo.findBySessionId(sessionId).orElse(null);
        if (result == null) return Map.of("status", "NOT_FOUND");

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("overallScore", result.getOverallScore());
        report.put("accuracy", result.getAccuracy());
        report.put("maxScore", result.getMaxScore());
        report.put("questionsAttempted", result.getQuestionsAttempted());
        report.put("questionsCorrect", result.getQuestionsCorrect());
        report.put("timeTaken", result.getTimeTakenSeconds());
        report.put("status", result.getStatus());
        report.put("passed", result.getOverallScore().compareTo(new BigDecimal("60")) >= 0);
        return report;
    }
}
