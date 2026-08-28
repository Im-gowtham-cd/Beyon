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

    @PostMapping
    public ResponseEntity<ApiResponse<Question>> createQuestion(@RequestBody java.util.Map<String, Object> body) {
        Question q = new Question();
        if (body.get("skillId") != null && !body.get("skillId").toString().isBlank()) {
            q.setSkillId(UUID.fromString((String) body.get("skillId")));
        }
        if (body.get("topicId") != null && !body.get("topicId").toString().isBlank()) {
            q.setTopicId(UUID.fromString((String) body.get("topicId")));
        }
        q.setTitle((String) body.getOrDefault("title", "Untitled Question"));
        q.setDescription((String) body.getOrDefault("description", ""));
        q.setQuestionType((String) body.getOrDefault("questionType", "MCQ"));
        q.setDifficulty((String) body.getOrDefault("difficulty", "MEDIUM"));
        q.setExplanation((String) body.get("explanation"));
        q.setExpectedOutput((String) body.get("expectedOutput"));
        q.setCodeTemplate((String) body.get("codeTemplate"));
        q.setStatus("ACTIVE");
        q.setEvaluationMethod("EXACT_MATCH");

        java.util.List<java.util.Map<String, Object>> rawOptions = (java.util.List<java.util.Map<String, Object>>) body.get("options");
        java.util.List<QuestionOption> options = new java.util.ArrayList<>();
        if (rawOptions != null) {
            int order = 1;
            for (java.util.Map<String, Object> ro : rawOptions) {
                QuestionOption opt = new QuestionOption();
                opt.setOptionText((String) ro.getOrDefault("optionText", ""));
                opt.setCorrect(Boolean.TRUE.equals(ro.get("isCorrect")) || Boolean.TRUE.equals(ro.get("correct")));
                opt.setDisplayOrder(order++);
                if (ro.get("explanation") != null) opt.setExplanation((String) ro.get("explanation"));
                options.add(opt);
            }
        }

        Question saved = questionBankService.createFullQuestion(q, options, null);
        return ResponseEntity.ok(ApiResponse.ok(saved, "Question created successfully"));
    }
}
