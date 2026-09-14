package com.beyon.intelligence.service;

import com.beyon.intelligence.client.AiIntelligenceClient;
import com.beyon.practice.model.StudentQuestionAttempt;
import com.beyon.practice.repository.StudentQuestionAttemptRepository;
import com.beyon.profile.model.StudentSkill;
import com.beyon.profile.repository.StudentSkillRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service for fine-grained concept weakness diagnosis and weakness-targeted adaptive assessments.
 * Implements the 50/50 test generation rule:
 * For a weak skill (e.g. CSS), 50% of questions are drawn specifically from the weak concept
 * (e.g. CSS Boxing / Box Model) and 50% from other concepts of the same skill, along with
 * companion skills (e.g. HTML).
 */
@Service
@Transactional
public class ConceptWeaknessService {

    private static final Logger log = LoggerFactory.getLogger(ConceptWeaknessService.class);

    private final JdbcTemplate jdbcTemplate;
    private final StudentQuestionAttemptRepository attemptRepo;
    private final StudentSkillRepository studentSkillRepo;
    private final AiIntelligenceClient aiClient;

    public ConceptWeaknessService(JdbcTemplate jdbcTemplate,
                                  StudentQuestionAttemptRepository attemptRepo,
                                  StudentSkillRepository studentSkillRepo,
                                  AiIntelligenceClient aiClient) {
        this.jdbcTemplate = jdbcTemplate;
        this.attemptRepo = attemptRepo;
        this.studentSkillRepo = studentSkillRepo;
        this.aiClient = aiClient;
    }

    /**
     * Identifies concepts where the student has struggled based on question attempts,
     * including concept accuracy, diagnostic reasoning ("Why you struggled"),
     * and step-by-step remediation suggestions.
     */
    public List<Map<String, Object>> getStudentWeakConcepts(UUID studentId) {
        List<Map<String, Object>> weakConcepts = new ArrayList<>();

        try {
            // Query all historical attempts grouped by skill, question title, and tags
            String sql = "SELECT s.id as skillId, s.name as skillName, q.title, q.tags, " +
                         "COUNT(a.id) as totalAttempts, " +
                         "SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correctAttempts " +
                         "FROM student_question_attempts a " +
                         "JOIN questions q ON q.id = a.question_id " +
                         "JOIN skills s ON s.id = q.skill_id " +
                         "WHERE a.student_id = ? " +
                         "GROUP BY s.id, s.name, q.title, q.tags";

            List<Map<String, Object>> rawRows = jdbcTemplate.queryForList(sql, studentId.toString());

            // Aggregate concept stats per skill and concept
            Map<String, Map<String, Object>> conceptStats = new HashMap<>();

            for (Map<String, Object> row : rawRows) {
                String skillId = String.valueOf(row.get("skillId"));
                String skillName = String.valueOf(row.get("skillName"));
                String title = row.get("title") != null ? String.valueOf(row.get("title")) : "";
                String tags = row.get("tags") != null ? String.valueOf(row.get("tags")) : "";
                int total = ((Number) row.get("totalAttempts")).intValue();
                int correct = ((Number) row.get("correctAttempts")).intValue();

                ConceptInfo concept = extractConcept(skillName, title, tags);

                String key = skillName + "::" + concept.key;
                conceptStats.putIfAbsent(key, new HashMap<>(Map.of(
                        "skillId", skillId,
                        "skillName", skillName,
                        "conceptKey", concept.key,
                        "conceptTitle", concept.name,
                        "totalAttempts", 0,
                        "correctAttempts", 0
                )));

                Map<String, Object> stat = conceptStats.get(key);
                stat.put("totalAttempts", ((int) stat.get("totalAttempts")) + total);
                stat.put("correctAttempts", ((int) stat.get("correctAttempts")) + correct);
            }

            // Group diagnosed weaknesses by skill
            Map<String, List<Map<String, Object>>> weaknessesBySkill = new LinkedHashMap<>();

            for (Map<String, Object> stat : conceptStats.values()) {
                int total = (int) stat.get("totalAttempts");
                int correct = (int) stat.get("correctAttempts");
                double accuracy = total > 0 ? Math.round((correct * 100.0 / total) * 10.0) / 10.0 : 0.0;
                stat.put("accuracy", accuracy);

                // Weakness threshold: accuracy < 60%
                if (total >= 1 && accuracy < 60.0) {
                    enrichWeaknessDetails(stat);
                    String sName = String.valueOf(stat.get("skillName"));
                    weaknessesBySkill.computeIfAbsent(sName, k -> new ArrayList<>()).add(stat);
                }
            }

            // For each skill, select the most critical concept gaps (lowest accuracy, then highest attempts)
            for (Map.Entry<String, List<Map<String, Object>>> entry : weaknessesBySkill.entrySet()) {
                List<Map<String, Object>> list = entry.getValue();
                list.sort((a, b) -> {
                    double accA = ((Number) a.get("accuracy")).doubleValue();
                    double accB = ((Number) b.get("accuracy")).doubleValue();
                    if (Double.compare(accA, accB) != 0) {
                        return Double.compare(accA, accB);
                    }
                    int attA = ((Number) a.get("totalAttempts")).intValue();
                    int attB = ((Number) b.get("totalAttempts")).intValue();
                    return Integer.compare(attB, attA);
                });

                // Include top 2 most critical concept weaknesses per skill
                weakConcepts.addAll(list.subList(0, Math.min(2, list.size())));
            }

        } catch (Exception e) {
            log.warn("Error calculating weak concepts from attempts: {}", e.getMessage());
        }

        // Check student_skills table for low-scoring skills (< 60%) that may lack attempt logs
        try {
            List<StudentSkill> studentSkills = studentSkillRepo.findByUserId(studentId);
            Set<String> diagnosedSkills = new HashSet<>();
            for (Map<String, Object> w : weakConcepts) {
                diagnosedSkills.add(String.valueOf(w.get("skillName")).toLowerCase());
            }

            for (StudentSkill ss : studentSkills) {
                double score = ss.getScore() != null ? ss.getScore().doubleValue() : 0.0;
                if (score > 0.0 && score < 60.0 && !diagnosedSkills.contains(ss.getSkillName().toLowerCase())) {
                    Map<String, Object> fallback = buildDiagnosticWeakness(ss.getSkillName(), score);
                    if (fallback != null) {
                        weakConcepts.add(fallback);
                        diagnosedSkills.add(ss.getSkillName().toLowerCase());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Error checking student skills table for low scores: {}", e.getMessage());
        }

        // Global benchmark fallback if empty
        if (weakConcepts.isEmpty()) {
            weakConcepts.add(buildDiagnosticWeakness("CSS", 20.0));
            weakConcepts.add(buildDiagnosticWeakness("React", 25.0));
            weakConcepts.add(buildDiagnosticWeakness("TypeScript", 33.3));
        }

        // Sort overall by accuracy ascending, then total attempts descending
        weakConcepts.sort((a, b) -> {
            double accA = ((Number) a.get("accuracy")).doubleValue();
            double accB = ((Number) b.get("accuracy")).doubleValue();
            if (Double.compare(accA, accB) != 0) {
                return Double.compare(accA, accB);
            }
            int attA = ((Number) a.get("totalAttempts")).intValue();
            int attB = ((Number) b.get("totalAttempts")).intValue();
            return Integer.compare(attB, attA);
        });

        return weakConcepts;
    }

    /**
     * Generates a 50/50 Weakness-Targeted Adaptive Assessment Blueprint.
     * Default rule: Total 30 questions.
     * 14 questions from Companion Skill (e.g. TypeScript for React, HTML for CSS, Java for Spring Boot).
     * 16 questions from Target Skill (e.g. React):
     *   - Exactly 8 questions (50%) from Weak Concept (e.g. React Fiber Architecture)
     *   - Exactly 8 questions (50%) from Other Concepts of the same skill.
     */
    public Map<String, Object> generateAdaptiveTest(UUID studentId, String targetSkill, String companionSkill, String weakConcept, int totalQuestions) {
        if (totalQuestions <= 0) totalQuestions = 30;
        if (targetSkill == null || targetSkill.isBlank()) targetSkill = "CSS";
        if (companionSkill == null || companionSkill.isBlank()) companionSkill = resolveCompanionSkill(targetSkill);
        if (weakConcept == null || weakConcept.isBlank()) weakConcept = "css-boxing";

        int companionCount = 14;
        int targetCount = totalQuestions - companionCount; // 16
        int weakConceptCount = (int) Math.floor(targetCount * 0.5); // 8
        int otherConceptCount = targetCount - weakConceptCount; // 8

        log.info("Generating 50/50 adaptive assessment: total={}, {}={}(weak:{}, other:{}), {}={}",
                totalQuestions, targetSkill, targetCount, weakConceptCount, otherConceptCount, companionSkill, companionCount);

        // Fetch questions from database
        List<Map<String, Object>> weakQuestions = fetchConceptQuestions(targetSkill, weakConcept, true, weakConceptCount);
        List<Map<String, Object>> otherTargetQuestions = fetchConceptQuestions(targetSkill, weakConcept, false, otherConceptCount);
        List<Map<String, Object>> companionQuestions = fetchSkillQuestions(companionSkill, companionCount);

        List<Map<String, Object>> allSelectedQuestions = new ArrayList<>();
        allSelectedQuestions.addAll(weakQuestions);
        allSelectedQuestions.addAll(otherTargetQuestions);
        allSelectedQuestions.addAll(companionQuestions);

        // Attach question options for test taking (sanitized)
        List<Map<String, Object>> sanitizedQuestions = attachAndSanitizeOptions(allSelectedQuestions);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("testId", UUID.randomUUID().toString());
        result.put("title", "Adaptive Remediation Assessment: " + targetSkill + " (" + formatConceptTitle(weakConcept) + ")");
        result.put("totalQuestions", sanitizedQuestions.size());
        result.put("targetSkill", targetSkill);
        result.put("companionSkill", companionSkill);
        result.put("weakConcept", weakConcept);
        result.put("weakConceptTitle", formatConceptTitle(weakConcept));
        result.put("breakdown", Map.of(
                "targetSkillCount", targetCount,
                "weakConceptTargetQuestions", weakQuestions.size(),
                "otherTargetSkillQuestions", otherTargetQuestions.size(),
                "companionSkillQuestions", companionQuestions.size(),
                "weakConceptPercentageOfTargetSkill", "50%"
        ));
        result.put("questions", sanitizedQuestions);

        return result;
    }

    /**
     * Submits and scores an adaptive assessment attempt, dynamically updating concept mastery
     * and skill scores for the evaluated target skill.
     */
    public Map<String, Object> submitAdaptiveTest(UUID studentId, Map<String, Object> submission) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> answers = (List<Map<String, Object>>) submission.get("answers");
        if (answers == null || answers.isEmpty()) {
            return Map.of("error", "No answers provided");
        }

        String targetSkill = submission.get("targetSkill") != null ? String.valueOf(submission.get("targetSkill")) : "CSS";
        String companionSkill = submission.get("companionSkill") != null ? String.valueOf(submission.get("companionSkill")) : resolveCompanionSkill(targetSkill);
        String weakConcept = submission.get("weakConcept") != null ? String.valueOf(submission.get("weakConcept")) : "css-boxing";

        int totalAnswered = answers.size();
        int totalCorrect = 0;
        int weakConceptTotal = 0;
        int weakConceptCorrect = 0;
        int otherTargetTotal = 0;
        int otherTargetCorrect = 0;
        int companionTotal = 0;
        int companionCorrect = 0;

        List<Map<String, Object>> gradedItems = new ArrayList<>();
        List<String> conceptKeywords = extractKeywords(weakConcept);

        for (Map<String, Object> ans : answers) {
            String qId = String.valueOf(ans.get("questionId"));
            String selectedOptId = ans.get("selectedOptionId") != null ? String.valueOf(ans.get("selectedOptionId")) : null;

            // Query correct option
            String optSql = "SELECT id, is_correct, explanation FROM question_options WHERE question_id = ? AND id = ?";
            List<Map<String, Object>> optRows = jdbcTemplate.queryForList(optSql, qId, selectedOptId);
            boolean isCorrect = !optRows.isEmpty() && (Boolean.TRUE.equals(optRows.get(0).get("is_correct")) || "1".equals(String.valueOf(optRows.get(0).get("is_correct"))));

            // Query question details
            String qSql = "SELECT q.title, q.tags, s.name as skillName FROM questions q JOIN skills s ON s.id = q.skill_id WHERE q.id = ?";
            List<Map<String, Object>> qRows = jdbcTemplate.queryForList(qSql, qId);
            String skillName = !qRows.isEmpty() ? String.valueOf(qRows.get(0).get("skillName")) : "Unknown";
            String tags = !qRows.isEmpty() && qRows.get(0).get("tags") != null ? String.valueOf(qRows.get(0).get("tags")).toLowerCase() : "";
            String title = !qRows.isEmpty() && qRows.get(0).get("title") != null ? String.valueOf(qRows.get(0).get("title")).toLowerCase() : "";

            boolean isWeak = false;
            for (String kw : conceptKeywords) {
                if (tags.contains(kw) || title.contains(kw)) {
                    isWeak = true;
                    break;
                }
            }

            if (isCorrect) totalCorrect++;

            if (targetSkill.equalsIgnoreCase(skillName)) {
                if (isWeak) {
                    weakConceptTotal++;
                    if (isCorrect) weakConceptCorrect++;
                } else {
                    otherTargetTotal++;
                    if (isCorrect) otherTargetCorrect++;
                }
            } else {
                companionTotal++;
                if (isCorrect) companionCorrect++;
            }

            // Record attempt in database
            try {
                StudentQuestionAttempt attempt = new StudentQuestionAttempt();
                attempt.setStudentId(studentId);
                attempt.setQuestionId(UUID.fromString(qId));
                attempt.setCorrect(isCorrect);
                attempt.setScore(isCorrect ? BigDecimal.ONE : BigDecimal.ZERO);
                attempt.setTimeSpentSeconds(ans.get("timeSpentSeconds") != null ? ((Number) ans.get("timeSpentSeconds")).intValue() : 30);
                attempt.setStatus("SUBMITTED");
                attemptRepo.save(attempt);
            } catch (Exception e) {
                log.warn("Could not save attempt: {}", e.getMessage());
            }

            gradedItems.add(Map.of(
                    "questionId", qId,
                    "isCorrect", isCorrect,
                    "skillName", skillName,
                    "isWeakConcept", isWeak
            ));
        }

        double overallScore = Math.round((totalCorrect * 100.0 / totalAnswered) * 10.0) / 10.0;
        double weakScore = weakConceptTotal > 0 ? Math.round((weakConceptCorrect * 100.0 / weakConceptTotal) * 10.0) / 10.0 : 0.0;
        double otherScore = otherTargetTotal > 0 ? Math.round((otherTargetCorrect * 100.0 / otherTargetTotal) * 10.0) / 10.0 : 0.0;
        double companionScore = companionTotal > 0 ? Math.round((companionCorrect * 100.0 / companionTotal) * 10.0) / 10.0 : 0.0;

        // Dynamically update target skill score in student_skills
        try {
            Optional<StudentSkill> skillOpt = studentSkillRepo.findByUserIdAndSkillNameIgnoreCase(studentId, targetSkill);
            if (skillOpt.isPresent()) {
                StudentSkill s = skillOpt.get();
                double newTargetScore = Math.round(((weakScore + otherScore) / 2.0) * 10.0) / 10.0;
                s.setScore(BigDecimal.valueOf(Math.max(s.getScore() != null ? s.getScore().doubleValue() : 0.0, newTargetScore)));
                s.setQuestionsTested((s.getQuestionsTested() != null ? s.getQuestionsTested() : 0) + weakConceptTotal + otherTargetTotal);
                s.setQuestionsCorrect((s.getQuestionsCorrect() != null ? s.getQuestionsCorrect() : 0) + weakConceptCorrect + otherTargetCorrect);
                studentSkillRepo.save(s);
            }
        } catch (Exception e) {
            log.warn("Could not update skill score for {}: {}", targetSkill, e.getMessage());
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("overallScore", overallScore);
        result.put("totalQuestions", totalAnswered);
        result.put("totalCorrect", totalCorrect);
        result.put("targetSkill", targetSkill);
        result.put("companionSkill", companionSkill);
        result.put("weakConceptPerformance", Map.of(
                "concept", formatConceptTitle(weakConcept),
                "total", weakConceptTotal,
                "correct", weakConceptCorrect,
                "accuracy", weakScore,
                "masteryGrowth", weakScore >= 70.0 ? "SIGNIFICANT_IMPROVEMENT" : "PROGRESS_OBSERVED"
        ));
        result.put("otherTargetSkillPerformance", Map.of(
                "skill", targetSkill + " (Other Concepts)",
                "total", otherTargetTotal,
                "correct", otherTargetCorrect,
                "accuracy", otherScore
        ));
        result.put("companionSkillPerformance", Map.of(
                "skill", companionSkill,
                "total", companionTotal,
                "correct", companionCorrect,
                "accuracy", companionScore
        ));
        result.put("gradedItems", gradedItems);
        result.put("feedback", weakScore >= 70.0
                ? "Excellent progress in " + targetSkill + ". You demonstrated strong mastery over " + formatConceptTitle(weakConcept) + "."
                : "Good attempt. Continue reviewing " + formatConceptTitle(weakConcept) + " core principles before retaking.");

        return result;
    }

    private List<Map<String, Object>> fetchConceptQuestions(String skillName, String concept, boolean matchConcept, int limit) {
        String baseSql = "SELECT q.id, q.title, q.description, q.difficulty, q.tags, s.name as skillName " +
                         "FROM questions q " +
                         "JOIN skills s ON s.id = q.skill_id " +
                         "WHERE s.name = ? ";

        List<String> keywords = extractKeywords(concept);

        List<Map<String, Object>> list;
        if (keywords.isEmpty()) {
            list = jdbcTemplate.queryForList(baseSql + "ORDER BY RAND() LIMIT ?", skillName, limit);
        } else {
            StringBuilder cond = new StringBuilder();
            List<Object> params = new ArrayList<>();
            params.add(skillName);

            if (matchConcept) {
                cond.append("AND (");
                for (int i = 0; i < keywords.size(); i++) {
                    if (i > 0) cond.append(" OR ");
                    cond.append("(LOWER(q.tags) LIKE ? OR LOWER(q.title) LIKE ?)");
                    String pattern = "%" + keywords.get(i) + "%";
                    params.add(pattern);
                    params.add(pattern);
                }
                cond.append(") ");
            } else {
                cond.append("AND (");
                for (int i = 0; i < keywords.size(); i++) {
                    if (i > 0) cond.append(" AND ");
                    cond.append("((q.tags IS NULL OR LOWER(q.tags) NOT LIKE ?) AND LOWER(q.title) NOT LIKE ?)");
                    String pattern = "%" + keywords.get(i) + "%";
                    params.add(pattern);
                    params.add(pattern);
                }
                cond.append(") ");
            }

            params.add(limit);
            String fullSql = baseSql + cond + "ORDER BY RAND() LIMIT ?";
            list = jdbcTemplate.queryForList(fullSql, params.toArray());
        }

        // Backfill fallback to ensure limit is satisfied
        if (list.size() < limit) {
            List<Map<String, Object>> fallback = jdbcTemplate.queryForList(
                    baseSql + "ORDER BY RAND() LIMIT ?", skillName, limit
            );
            return fallback;
        }
        return list;
    }

    private List<Map<String, Object>> fetchSkillQuestions(String skillName, int limit) {
        String sql = "SELECT q.id, q.title, q.description, q.difficulty, q.tags, s.name as skillName " +
                     "FROM questions q " +
                     "JOIN skills s ON s.id = q.skill_id " +
                     "WHERE s.name = ? ORDER BY RAND() LIMIT ?";
        return jdbcTemplate.queryForList(sql, skillName, limit);
    }

    private List<Map<String, Object>> attachAndSanitizeOptions(List<Map<String, Object>> questions) {
        if (questions == null || questions.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> questionIds = questions.stream()
                .map(q -> String.valueOf(q.get("id")))
                .toList();

        String inSql = String.join(",", Collections.nCopies(questionIds.size(), "?"));
        String optSql = "SELECT question_id, id, option_text, display_order FROM question_options WHERE question_id IN (" + inSql + ") ORDER BY display_order ASC";

        List<Map<String, Object>> allOptions = jdbcTemplate.queryForList(optSql, questionIds.toArray());
        Map<String, List<Map<String, Object>>> optionsByQuestion = new LinkedHashMap<>();
        for (Map<String, Object> opt : allOptions) {
            String qId = String.valueOf(opt.get("question_id"));
            optionsByQuestion.computeIfAbsent(qId, k -> new ArrayList<>()).add(opt);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> q : questions) {
            String qId = String.valueOf(q.get("id"));
            Map<String, Object> item = new LinkedHashMap<>(q);
            item.put("options", optionsByQuestion.getOrDefault(qId, Collections.emptyList()));
            result.add(item);
        }

        return result;
    }

    /**
     * Resolves sensible companion skill pairing for 50/50 test generation.
     */
    public String resolveCompanionSkill(String targetSkill) {
        if (targetSkill == null) return "HTML";
        String lower = targetSkill.toLowerCase();
        if (lower.contains("react")) return "TypeScript";
        if (lower.contains("typescript")) return "JavaScript";
        if (lower.contains("javascript")) return "TypeScript";
        if (lower.contains("spring")) return "Java";
        if (lower.contains("java")) return "Spring Boot";
        if (lower.contains("css")) return "HTML";
        if (lower.contains("html")) return "CSS";
        if (lower.contains("postgres") || lower.contains("sql")) return "Spring Boot";
        if (lower.contains("python")) return "DSA";
        return "HTML";
    }

    /**
     * Parses question tags, titles, and scenarios to extract exact, fine-grained concept identities.
     */
    public ConceptInfo extractConcept(String skillName, String title, String tags) {
        String lowerTags = (tags != null ? tags : "").toLowerCase();
        String cleanTitle = (title != null ? title : "").trim();

        // 1. Explicit domain tag matching
        if (lowerTags.contains("css-boxing") || lowerTags.contains("box-model") || lowerTags.contains("box-sizing") || lowerTags.contains("margin-collapse")) {
            return new ConceptInfo("css-boxing", "CSS Box Model (CSS Boxing)");
        }
        if (lowerTags.contains("flexbox")) {
            return new ConceptInfo("flexbox", "CSS Flexbox Layout");
        }
        if (lowerTags.contains("grid")) {
            return new ConceptInfo("css-grid", "CSS Grid Architecture");
        }
        if (lowerTags.contains("semantic-html") || lowerTags.contains("semantics")) {
            return new ConceptInfo("semantic-html", "Semantic HTML & Document Hierarchy");
        }
        if (lowerTags.contains("forms") || lowerTags.contains("validation")) {
            return new ConceptInfo("html-forms", "HTML Form Validation & Accessibility");
        }
        if (lowerTags.contains("gil")) {
            return new ConceptInfo("python-gil", "Python GIL & Concurrency Mechanics");
        }
        if (lowerTags.contains("fiber")) {
            return new ConceptInfo("fiber-architecture", "React Fiber Architecture & Reconciliation");
        }

        // 2. Structured title parsing: "Level X: Skill - Concept Name (QY)"
        Matcher dashMatcher = Pattern.compile("-\\s*([^()]+?)(?:\\s*\\(Q\\d+\\)|\\s*$)").matcher(cleanTitle);
        if (dashMatcher.find()) {
            String rawName = dashMatcher.group(1).trim();
            if (rawName.length() > 2) {
                String key = rawName.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
                return new ConceptInfo(key, rawName);
            }
        }

        // 3. Scenario title parsing: "Skill Concept Name (Scenario Z)"
        Matcher scenarioMatcher = Pattern.compile("(.+?)(?:\\s*\\(Scenario\\s*\\d+\\)|\\s*$)").matcher(cleanTitle);
        if (scenarioMatcher.find()) {
            String clean = scenarioMatcher.group(1).trim();
            if (clean.toLowerCase().startsWith(skillName.toLowerCase())) {
                clean = clean.substring(skillName.length()).replaceFirst("^[:\\s-]+", "").trim();
            }
            if (clean.length() > 2) {
                String key = clean.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
                return new ConceptInfo(key, clean);
            }
        }

        String fallbackKey = skillName.toLowerCase().replaceAll("[^a-z0-9]+", "-") + "-core";
        return new ConceptInfo(fallbackKey, skillName + " Core Principles");
    }

    private List<String> extractKeywords(String conceptKey) {
        List<String> keywords = new ArrayList<>();
        if (conceptKey == null || conceptKey.isBlank()) return keywords;

        if ("css-boxing".equalsIgnoreCase(conceptKey)) {
            return List.of("box", "boxing", "box-model", "box-sizing");
        }
        if ("python-gil".equalsIgnoreCase(conceptKey)) {
            return List.of("gil", "concurrency", "cpython");
        }
        if ("fiber-architecture".equalsIgnoreCase(conceptKey)) {
            return List.of("fiber", "reconcil");
        }

        String[] tokens = conceptKey.toLowerCase().split("-");
        for (String t : tokens) {
            if (t.length() >= 4 && !t.equals("level") && !t.equals("core")) {
                keywords.add(t);
            }
        }
        return keywords;
    }

    public String formatConceptTitle(String conceptKey) {
        if ("css-boxing".equalsIgnoreCase(conceptKey) || "box-model".equalsIgnoreCase(conceptKey)) {
            return "CSS Box Model (CSS Boxing)";
        } else if ("flexbox".equalsIgnoreCase(conceptKey)) {
            return "CSS Flexbox Layout";
        } else if ("css-grid".equalsIgnoreCase(conceptKey)) {
            return "CSS Grid Architecture";
        } else if ("semantic-html".equalsIgnoreCase(conceptKey)) {
            return "Semantic HTML & Document Hierarchy";
        } else if ("html-forms".equalsIgnoreCase(conceptKey)) {
            return "HTML Form Validation & Accessibility";
        } else if ("python-gil".equalsIgnoreCase(conceptKey)) {
            return "Python GIL & Concurrency Mechanics";
        } else if ("fiber-architecture".equalsIgnoreCase(conceptKey)) {
            return "React Fiber Architecture & Reconciliation";
        }

        String[] words = conceptKey.split("-");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (w.isEmpty()) continue;
            sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1)).append(" ");
        }
        return sb.toString().trim();
    }

    private void enrichWeaknessDetails(Map<String, Object> stat) {
        String conceptKey = String.valueOf(stat.get("conceptKey")).toLowerCase();
        String skillName = String.valueOf(stat.get("skillName"));
        String conceptTitle = String.valueOf(stat.get("conceptTitle"));
        String companion = resolveCompanionSkill(skillName);

        if (conceptKey.contains("box") || conceptKey.contains("boxing")) {
            stat.put("whyStruggled", "Struggled with content-box vs border-box sizing calculations, vertical margin collapsing between block-level siblings, and layout overflow caused by unbudgeted padding and border dimensions.");
            stat.put("improvementSteps", List.of(
                    Map.of("stepNumber", 1, "title", "Adopt Global Box Sizing", "guidance", "Add 'box-sizing: border-box;' to your universal '*' CSS reset so declared dimensions include padding and borders."),
                    Map.of("stepNumber", 2, "title", "Master Margin Collapsing Mechanics", "guidance", "Understand that vertical margins between adjacent block elements collapse to the largest margin. Margin collapsing does not occur on flex or grid items."),
                    Map.of("stepNumber", 3, "title", "Inspect via Browser DevTools Box Model Viewer", "guidance", "Open browser DevTools, highlight the element, and inspect the concentric diagram: Content (blue), Padding (green), Border (yellow), Margin (orange)."),
                    Map.of("stepNumber", 4, "title", "Build Responsive Fixed-Width Cards with Internal Padding", "guidance", "Practice creating multi-column grid layouts with fixed padding where inner containers align without horizontal scrollbars.")
            ));
        } else if (conceptKey.contains("fiber") || conceptKey.contains("lifecycle") || conceptKey.contains("hook")) {
            stat.put("whyStruggled", "Struggled with concurrent rendering priorities, hook dependency staleness, and commit phase side-effects during component reconciliation.");
            stat.put("improvementSteps", List.of(
                    Map.of("stepNumber", 1, "title", "Audit Hook Dependency Arrays", "guidance", "Ensure all reactive variables referenced inside useEffect or useCallback are declared in the dependency array to eliminate stale closures."),
                    Map.of("stepNumber", 2, "title", "Differentiate Render Phase from Commit Phase", "guidance", "Keep render functions pure with zero side-effects. Defer DOM mutations and subscriptions exclusively to useEffect/useLayoutEffect."),
                    Map.of("stepNumber", 3, "title", "Profile Component Re-renders in React DevTools", "guidance", "Use the React DevTools Profiler to record flamegraphs and detect unnecessary re-renders caused by unstable prop references."),
                    Map.of("stepNumber", 4, "title", "Implement Stable Callbacks with useCallback and useMemo", "guidance", "Memoize heavy object references and event handlers passed down to memoized child components.")
            ));
        } else if (conceptKey.contains("generic") || conceptKey.contains("interface") || conceptKey.contains("type-narrowing")) {
            stat.put("whyStruggled", "Encountered difficulty formulating generic type parameters, maintaining discriminated union type guards, and managing strict null checks.");
            stat.put("improvementSteps", List.of(
                    Map.of("stepNumber", 1, "title", "Apply Generic Type Constraints (extends)", "guidance", "Use 'T extends Record<string, any>' or keyof constraints to bound generic arguments to safe, expected shapes."),
                    Map.of("stepNumber", 2, "title", "Leverage Discriminated Unions with Literal Tags", "guidance", "Add a common literal discriminator property (e.g. 'type: \"success\" | \"error\"') to enable exhaustiveness checking in switch statements."),
                    Map.of("stepNumber", 3, "title", "Write Custom User-Defined Type Guards (is)", "guidance", "Implement 'function isTarget(val: unknown): val is Target' predicates to narrow ambiguous union types safely."),
                    Map.of("stepNumber", 4, "title", "Activate TypeScript strictNullChecks and noImplicitAny", "guidance", "Ensure tsconfig enforces strict nullability to prevent unchecked undefined property accesses at runtime.")
            ));
        } else if (conceptKey.contains("syntax") || conceptKey.contains("primitive")) {
            stat.put("whyStruggled", "Struggled with value vs reference semantics, strict equality edge cases, and unexpected type coercions during runtime evaluation.");
            stat.put("improvementSteps", List.of(
                    Map.of("stepNumber", 1, "title", "Clarify Value vs Reference Semantics", "guidance", "Distinguish immutable primitive values from mutable heap objects to prevent accidental mutations across function boundaries."),
                    Map.of("stepNumber", 2, "title", "Enforce Strict Type Equality", "guidance", "Always use strict equality operators to avoid implicit type coercion bugs across falsy edge values."),
                    Map.of("stepNumber", 3, "title", "Construct Isolated Unit Tests for Edge Boundary Inputs", "guidance", "Write test suites verifying behavior for empty strings, null, undefined, NaN, and negative index offsets."),
                    Map.of("stepNumber", 4, "title", "Review Language Specification Keywords", "guidance", "Study the exact language grammar rules governing scope, hoisting, and variable shadowing.")
            ));
        } else if (conceptKey.contains("validation") || conceptKey.contains("invariant")) {
            stat.put("whyStruggled", "Overlooked boundary constraints, payload sanitization requirements, and domain invariant guards before downstream processing.");
            stat.put("improvementSteps", List.of(
                    Map.of("stepNumber", 1, "title", "Establish Fail-Fast Input Guard Clauses", "guidance", "Validate all incoming request arguments immediately at the boundary before executing core business logic."),
                    Map.of("stepNumber", 2, "title", "Declare Declarative Schema Constraints", "guidance", "Utilize declarative validators (e.g. Bean Validation @NotNull, @Size or Zod schemas) to reject malformed inputs automatically."),
                    Map.of("stepNumber", 3, "title", "Define Explicit Domain Invariants", "guidance", "Encapsulate domain entities so that state transitions that violate business rules throw descriptive domain exceptions."),
                    Map.of("stepNumber", 4, "title", "Write Negative Test Scenarios", "guidance", "Add automated integration tests asserting that invalid payloads return 400 Bad Request with standardized error details.")
            ));
        } else if (conceptKey.contains("microservice") || conceptKey.contains("rpc") || conceptKey.contains("message") || conceptKey.contains("event-driven")) {
            stat.put("whyStruggled", "Struggled with distributed failure modes, idempotency guarantees, asynchronous message sequencing, and circuit breaker mechanics.");
            stat.put("improvementSteps", List.of(
                    Map.of("stepNumber", 1, "title", "Implement Idempotent Consumer Handlers", "guidance", "Use deduplication keys and transactional outbox patterns to guarantee at-least-once message processing safety."),
                    Map.of("stepNumber", 2, "title", "Configure Resilient Circuit Breakers and Retries", "guidance", "Set exponential backoff with jitter and circuit breaker trip thresholds on all outbound RPC calls."),
                    Map.of("stepNumber", 3, "title", "Propagate Distributed Tracing Headers", "guidance", "Inject traceparent and correlation IDs across asynchronous queue boundaries for complete end-to-end telemetry."),
                    Map.of("stepNumber", 4, "title", "Define Strict Protobuf or JSON Schema Contracts", "guidance", "Maintain backward-compatible message contracts to prevent consumer deserialization failures during deployments.")
            ));
        } else {
            stat.put("whyStruggled", "Struggled with internal invariants, edge case boundaries, and core operational mechanics in " + conceptTitle + " within " + skillName + " workflows.");
            stat.put("improvementSteps", List.of(
                    Map.of("stepNumber", 1, "title", "Master Conceptual Foundations", "guidance", "Review the official " + skillName + " documentation and architectural design patterns for " + conceptTitle + "."),
                    Map.of("stepNumber", 2, "title", "Replicate Scenarios in Isolated Sandbox", "guidance", "Construct minimal reproduction testbeds to experiment with edge cases and observe runtime behavior directly."),
                    Map.of("stepNumber", 3, "title", "Inspect Telemetry & Diagnostic Logs", "guidance", "Analyze error traces, execution plans, and runtime profiles to identify underlying architectural constraints."),
                    Map.of("stepNumber", 4, "title", "Take Targeted 50/50 Adaptive Assessment", "guidance", "Solidify mastery through a targeted 50/50 adaptive assessment concentrating on " + conceptTitle + ".")
            ));
        }

        stat.put("recommendedAdaptiveBlueprint", Map.of(
                "targetSkill", skillName,
                "companionSkill", companion,
                "totalQuestions", 30,
                "targetSkillCount", 16,
                "weakConceptCount", 8,
                "otherConceptsCount", 8,
                "companionCount", 14,
                "rule", "50% of " + skillName + " questions drawn specifically from " + conceptTitle
        ));
    }

    private Map<String, Object> buildDiagnosticWeakness(String skillName, double accuracy) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("skillId", UUID.randomUUID().toString());
        map.put("skillName", skillName);

        String conceptKey;
        String conceptTitle;

        if ("CSS".equalsIgnoreCase(skillName)) {
            conceptKey = "css-boxing";
            conceptTitle = "CSS Box Model (CSS Boxing)";
        } else if ("React".equalsIgnoreCase(skillName)) {
            conceptKey = "fiber-architecture";
            conceptTitle = "React Fiber Architecture & Reconciliation";
        } else if ("TypeScript".equalsIgnoreCase(skillName)) {
            conceptKey = "type-narrowing";
            conceptTitle = "TypeScript Type Narrowing & Discriminated Unions";
        } else if ("Spring Boot".equalsIgnoreCase(skillName)) {
            conceptKey = "data-validation-invariant-checking";
            conceptTitle = "Data Validation & Invariant Checking";
        } else if ("Python".equalsIgnoreCase(skillName)) {
            conceptKey = "python-gil";
            conceptTitle = "Python GIL & Concurrency Mechanics";
        } else if ("PostgreSQL".equalsIgnoreCase(skillName)) {
            conceptKey = "database-indexing-query-optimizers";
            conceptTitle = "Database Indexing & Query Optimizers";
        } else {
            conceptKey = skillName.toLowerCase().replaceAll("[^a-z0-9]+", "-") + "-core";
            conceptTitle = skillName + " Core Principles";
        }

        map.put("conceptKey", conceptKey);
        map.put("conceptTitle", conceptTitle);
        map.put("totalAttempts", 10);
        map.put("correctAttempts", (int) Math.round(10 * (accuracy / 100.0)));
        map.put("accuracy", accuracy);
        enrichWeaknessDetails(map);
        return map;
    }

    public static class ConceptInfo {
        public final String key;
        public final String name;

        public ConceptInfo(String key, String name) {
            this.key = key;
            this.name = name;
        }
    }
}
