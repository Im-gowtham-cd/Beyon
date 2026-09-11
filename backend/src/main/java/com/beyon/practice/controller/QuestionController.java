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
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public QuestionController(QuestionBankService questionBankService, org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.questionBankService = questionBankService;
        this.jdbcTemplate = jdbcTemplate;
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

        String qType = (String) body.getOrDefault("questionType", "SINGLE_CHOICE");
        q.setQuestionType(qType);
        q.setDifficulty((String) body.getOrDefault("difficulty", "MEDIUM"));
        q.setExplanation((String) body.get("explanation"));
        q.setExpectedOutput((String) body.get("expectedOutput"));
        q.setCodeTemplate((String) body.get("codeTemplate"));
        q.setStatus("ACTIVE");
        q.setEvaluationMethod("EXACT_MATCH");

        String creatorEmail = "skillcontent@beyon.io";
        UUID creatorId = null;
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof com.beyon.identity.security.JwtUserDetails userDetails) {
                if (userDetails.getEmail() != null) {
                    creatorEmail = userDetails.getEmail();
                }
                if (userDetails.getUserId() != null) {
                    creatorId = UUID.fromString(userDetails.getUserId());
                }
            }
        } catch (Exception ignored) {}

        if (creatorId != null) {
            q.setCreatedBy(creatorId);
        }

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

        // Record governance audit log in admin_audit_log
        try {
            jdbcTemplate.update(
                "INSERT INTO admin_audit_log (id, admin_id, action, target_type, target_id, details, ip_address, created_at) " +
                "VALUES (UUID(), ?, ?, 'QUESTION', ?, ?, '127.0.0.1', NOW())",
                creatorEmail,
                "QUESTION_CREATED_" + saved.getQuestionType(),
                saved.getId().toString(),
                "{\"title\":\"" + saved.getTitle().replace("\"", "\\\"") + "\",\"type\":\"" + saved.getQuestionType() + "\"}"
            );
        } catch (Exception ignored) {}

        return ResponseEntity.ok(ApiResponse.ok(saved, "Question created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Question>> updateQuestion(
            @PathVariable UUID id,
            @RequestBody java.util.Map<String, Object> body) {
        Question update = new Question();
        if (body.get("skillId") != null && !body.get("skillId").toString().isBlank()) {
            update.setSkillId(UUID.fromString((String) body.get("skillId")));
        }
        if (body.get("topicId") != null && !body.get("topicId").toString().isBlank()) {
            update.setTopicId(UUID.fromString((String) body.get("topicId")));
        }
        if (body.get("title") != null) update.setTitle((String) body.get("title"));
        if (body.get("description") != null) update.setDescription((String) body.get("description"));
        if (body.get("questionType") != null) update.setQuestionType((String) body.get("questionType"));
        if (body.get("difficulty") != null) update.setDifficulty((String) body.get("difficulty"));
        if (body.get("explanation") != null) update.setExplanation((String) body.get("explanation"));
        if (body.get("expectedOutput") != null) update.setExpectedOutput((String) body.get("expectedOutput"));
        if (body.get("codeTemplate") != null) update.setCodeTemplate((String) body.get("codeTemplate"));
        if (body.get("solution") != null) update.setSolution((String) body.get("solution"));
        if (body.get("status") != null) update.setStatus((String) body.get("status"));
        if (body.get("evaluationMethod") != null) update.setEvaluationMethod((String) body.get("evaluationMethod"));

        String userEmail = "skillcontent@beyon.io";
        UUID userId = null;
        boolean isAdmin = true;
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof com.beyon.identity.security.JwtUserDetails userDetails) {
                if (userDetails.getEmail() != null) userEmail = userDetails.getEmail();
                if (userDetails.getUserId() != null) userId = UUID.fromString(userDetails.getUserId());
                isAdmin = userDetails.isSuperAdmin()
                        || "CONTENT_ADMIN".equalsIgnoreCase(userDetails.getRole())
                        || "PLATFORM_ADMIN".equalsIgnoreCase(userDetails.getRole())
                        || "QUESTION_SETTER".equalsIgnoreCase(userDetails.getRole());
            }
        } catch (Exception ignored) {}

        java.util.List<java.util.Map<String, Object>> rawOptions = (java.util.List<java.util.Map<String, Object>>) body.get("options");
        java.util.List<QuestionOption> options = null;
        if (rawOptions != null) {
            options = new java.util.ArrayList<>();
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

        Question saved = questionBankService.updateFullQuestion(id, update, options, null, userId, isAdmin);

        try {
            jdbcTemplate.update(
                "INSERT INTO admin_audit_log (id, admin_id, action, target_type, target_id, details, ip_address, created_at) " +
                "VALUES (UUID(), ?, 'QUESTION_UPDATED', 'QUESTION', ?, ?, '127.0.0.1', NOW())",
                userEmail,
                saved.getId().toString(),
                "{\"title\":\"" + saved.getTitle().replace("\"", "\\\"") + "\",\"type\":\"" + saved.getQuestionType() + "\"}"
            );
        } catch (Exception ignored) {}

        return ResponseEntity.ok(ApiResponse.ok(saved, "Question updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable UUID id) {
        String userEmail = "skillcontent@beyon.io";
        UUID userId = null;
        boolean isAdmin = true;
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof com.beyon.identity.security.JwtUserDetails userDetails) {
                if (userDetails.getEmail() != null) userEmail = userDetails.getEmail();
                if (userDetails.getUserId() != null) userId = UUID.fromString(userDetails.getUserId());
                isAdmin = userDetails.isSuperAdmin()
                        || "CONTENT_ADMIN".equalsIgnoreCase(userDetails.getRole())
                        || "PLATFORM_ADMIN".equalsIgnoreCase(userDetails.getRole())
                        || "QUESTION_SETTER".equalsIgnoreCase(userDetails.getRole());
            }
        } catch (Exception ignored) {}

        Question existing = questionBankService.getQuestion(id);
        String title = existing.getTitle();
        String qType = existing.getQuestionType();

        questionBankService.deleteQuestion(id, userId, isAdmin);

        try {
            jdbcTemplate.update(
                "INSERT INTO admin_audit_log (id, admin_id, action, target_type, target_id, details, ip_address, created_at) " +
                "VALUES (UUID(), ?, 'QUESTION_DELETED', 'QUESTION', ?, ?, '127.0.0.1', NOW())",
                userEmail,
                id.toString(),
                "{\"title\":\"" + (title != null ? title.replace("\"", "\\\"") : "") + "\",\"type\":\"" + (qType != null ? qType : "") + "\"}"
            );
        } catch (Exception ignored) {}

        return ResponseEntity.ok(ApiResponse.ok(null, "Question deleted successfully"));
    }
}

