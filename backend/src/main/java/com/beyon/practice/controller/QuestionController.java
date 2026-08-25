package com.beyon.practice.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.practice.model.Question;
import com.beyon.practice.model.QuestionOption;
import com.beyon.practice.model.QuestionTestCase;
import com.beyon.practice.service.QuestionBankService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/questions")
public class QuestionController {

    private final QuestionBankService questionBankService;

    public QuestionController(QuestionBankService questionBankService) {
        this.questionBankService = questionBankService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Question>>> getQuestions(
            @RequestParam(required = false) UUID skillId,
            @RequestParam(required = false) UUID topicId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok(questionBankService.searchQuestions(search, size)));
        }
        if (skillId != null) {
            return ResponseEntity.ok(ApiResponse.ok(questionBankService.getQuestionsBySkill(skillId, size)));
        }
        if (topicId != null) {
            return ResponseEntity.ok(ApiResponse.ok(questionBankService.getQuestionsByTopic(topicId, size)));
        }
        if (difficulty != null) {
            return ResponseEntity.ok(ApiResponse.ok(questionBankService.getQuestionsByDifficulty(difficulty, size)));
        }
        return ResponseEntity.ok(ApiResponse.ok(questionBankService.getPublishedQuestions(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Question>> getQuestion(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(questionBankService.getQuestion(id)));
    }

    @GetMapping("/{id}/options")
    public ResponseEntity<ApiResponse<List<QuestionOption>>> getOptions(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(questionBankService.getOptions(id)));
    }

    @GetMapping("/{id}/test-cases")
    public ResponseEntity<ApiResponse<List<QuestionTestCase>>> getTestCases(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(questionBankService.getTestCases(id)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<java.util.Map<String, Long>>> getStats() {
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("total", questionBankService.countPublished());
        stats.put("easy", questionBankService.countByDifficulty("EASY"));
        stats.put("medium", questionBankService.countByDifficulty("MEDIUM"));
        stats.put("hard", questionBankService.countByDifficulty("HARD"));
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
