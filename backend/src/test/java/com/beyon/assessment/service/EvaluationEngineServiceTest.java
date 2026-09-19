package com.beyon.assessment.service;

import com.beyon.assessment.model.AssessmentResult;
import com.beyon.assessment.repository.AssessmentResultRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EvaluationEngineServiceTest {

    private AssessmentResultRepository resultRepo;
    private ObjectMapper mapper;
    private EvaluationEngineService evaluationEngineService;

    @BeforeEach
    void setUp() {
        resultRepo = mock(AssessmentResultRepository.class);
        mapper = new ObjectMapper();
        evaluationEngineService = new EvaluationEngineService(resultRepo, mapper);
    }

    @Test
    @DisplayName("evaluate correctly scores 100% when all answers match")
    void testEvaluateAllCorrect() {
        UUID sessionId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        List<Map<String, Object>> answers = List.of(
                Map.of("userAnswer", "A", "correctAnswer", "A", "score", "5"),
                Map.of("userAnswer", "B", "correctAnswer", "B", "score", "5")
        );

        when(resultRepo.save(any(AssessmentResult.class))).thenAnswer(inv -> inv.getArgument(0));

        AssessmentResult result = evaluationEngineService.evaluate(sessionId, studentId, answers, new BigDecimal("10"));

        assertNotNull(result);
        assertEquals(2, result.getQuestionsAttempted());
        assertEquals(2, result.getQuestionsCorrect());
        assertEquals(new BigDecimal("100.00"), result.getAccuracy());
        assertEquals(new BigDecimal("100.00"), result.getOverallScore());
        assertEquals("COMPLETED", result.getStatus());
        verify(resultRepo).save(any(AssessmentResult.class));
    }

    @Test
    @DisplayName("evaluate computes 50% accuracy when half of answers are incorrect")
    void testEvaluateHalfCorrect() {
        UUID sessionId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        List<Map<String, Object>> answers = List.of(
                Map.of("userAnswer", "A", "correctAnswer", "A", "score", "10"),
                Map.of("userAnswer", "C", "correctAnswer", "B", "score", "10")
        );

        when(resultRepo.save(any(AssessmentResult.class))).thenAnswer(inv -> inv.getArgument(0));

        AssessmentResult result = evaluationEngineService.evaluate(sessionId, studentId, answers, new BigDecimal("20"));

        assertNotNull(result);
        assertEquals(2, result.getQuestionsAttempted());
        assertEquals(1, result.getQuestionsCorrect());
        assertEquals(new BigDecimal("50.00"), result.getAccuracy());
        assertEquals(new BigDecimal("50.00"), result.getOverallScore());
    }

    @Test
    @DisplayName("evaluate safely handles zero attempted questions without divide by zero")
    void testEvaluateZeroAttempted() {
        UUID sessionId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        List<Map<String, Object>> answers = List.of();

        when(resultRepo.save(any(AssessmentResult.class))).thenAnswer(inv -> inv.getArgument(0));

        AssessmentResult result = evaluationEngineService.evaluate(sessionId, studentId, answers, BigDecimal.ZERO);

        assertNotNull(result);
        assertEquals(0, result.getQuestionsAttempted());
        assertEquals(0, result.getQuestionsCorrect());
        assertEquals(BigDecimal.ZERO, result.getAccuracy());
        assertEquals(BigDecimal.ZERO, result.getOverallScore());
    }

    @Test
    @DisplayName("getResultReport returns passed true when score >= 60 and passed false when < 60")
    void testGetResultReportPassedAndFailed() {
        UUID passSessionId = UUID.randomUUID();
        AssessmentResult passResult = new AssessmentResult();
        passResult.setOverallScore(new BigDecimal("75.00"));
        passResult.setAccuracy(new BigDecimal("80.00"));
        passResult.setStatus("COMPLETED");

        when(resultRepo.findBySessionId(passSessionId)).thenReturn(Optional.of(passResult));

        Map<String, Object> passReport = evaluationEngineService.getResultReport(passSessionId);
        assertTrue((Boolean) passReport.get("passed"));

        UUID failSessionId = UUID.randomUUID();
        AssessmentResult failResult = new AssessmentResult();
        failResult.setOverallScore(new BigDecimal("45.00"));
        failResult.setStatus("COMPLETED");

        when(resultRepo.findBySessionId(failSessionId)).thenReturn(Optional.of(failResult));

        Map<String, Object> failReport = evaluationEngineService.getResultReport(failSessionId);
        assertFalse((Boolean) failReport.get("passed"));
    }

    @Test
    @DisplayName("getResultReport returns NOT_FOUND status for non-existent session")
    void testGetResultReportNotFound() {
        UUID unknownId = UUID.randomUUID();
        when(resultRepo.findBySessionId(unknownId)).thenReturn(Optional.empty());

        Map<String, Object> report = evaluationEngineService.getResultReport(unknownId);
        assertEquals("NOT_FOUND", report.get("status"));
    }
}
