package com.beyon.profile.service;

import com.beyon.practice.model.Question;
import com.beyon.practice.model.QuestionOption;
import com.beyon.practice.repository.QuestionOptionRepository;
import com.beyon.practice.repository.QuestionRepository;
import com.beyon.profile.enums.SkillProficiency;
import com.beyon.profile.model.Skill;
import com.beyon.profile.model.StudentSkill;
import com.beyon.profile.repository.SkillRepository;
import com.beyon.profile.repository.StudentSkillRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SkillVerificationService {

    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final SkillRepository skillRepository;
    private final StudentSkillRepository studentSkillRepository;

    public SkillVerificationService(QuestionRepository questionRepository,
                                  QuestionOptionRepository questionOptionRepository,
                                  SkillRepository skillRepository,
                                  StudentSkillRepository studentSkillRepository) {
        this.questionRepository = questionRepository;
        this.questionOptionRepository = questionOptionRepository;
        this.skillRepository = skillRepository;
        this.studentSkillRepository = studentSkillRepository;
    }

    /**
     * Generates a randomized quiz by sampling M questions out of the available N-question pool
     * matching the student's selected skills.
     */
    public Map<String, Object> generateVerificationQuiz(List<String> skillNames, int sampleCount) {
        int targetCount = sampleCount > 0 ? sampleCount : 5;
        if (skillNames == null) {
            skillNames = Collections.emptyList();
        }

        Set<UUID> matchedSkillIds = new HashSet<>();
        List<Skill> allActiveSkills = skillRepository.findAllActive();
        Map<UUID, String> skillIdToName = new HashMap<>();

        for (Skill s : allActiveSkills) {
            skillIdToName.put(s.getId(), s.getName());
            for (String inputSkill : skillNames) {
                if (s.getName().equalsIgnoreCase(inputSkill.trim()) ||
                    (s.getSlug() != null && s.getSlug().equalsIgnoreCase(inputSkill.trim())) ||
                    inputSkill.trim().toLowerCase().contains(s.getName().toLowerCase()) ||
                    s.getName().toLowerCase().contains(inputSkill.trim().toLowerCase())) {
                    matchedSkillIds.add(s.getId());
                }
            }
        }

        Set<Question> pool = new LinkedHashSet<>();

        // 1. Fetch questions by matched skill IDs
        for (UUID skillId : matchedSkillIds) {
            List<Question> bySkill = questionRepository.findBySkillIdPublished(skillId, PageRequest.of(0, 20));
            pool.addAll(bySkill);
        }

        // 2. Fetch questions by tags or title matching skill names
        for (String skillName : skillNames) {
            String trimmed = skillName.trim();
            if (!trimmed.isEmpty()) {
                List<Question> byTag = questionRepository.findByTagsContainingOrderByCreatedAtAsc(trimmed.toLowerCase());
                pool.addAll(byTag);

                List<Question> byTitle = questionRepository.findByStatusInAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(
                        List.of("PUBLISHED", "ACTIVE"), trimmed, PageRequest.of(0, 10));
                pool.addAll(byTitle);
            }
        }

        // 3. Fallback: if pool is small, supplement with general published technical questions
        if (pool.size() < targetCount) {
            List<Question> fallback = questionRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED", PageRequest.of(0, targetCount * 3));
            if (fallback.isEmpty()) {
                fallback = questionRepository.findByStatusInOrderByCreatedAtDesc(List.of("PUBLISHED", "ACTIVE", "DRAFT"), PageRequest.of(0, targetCount * 3));
            }
            pool.addAll(fallback);
        }

        List<Question> poolList = new ArrayList<>(pool);
        int totalPoolSize = poolList.size();

        // Shuffled random sampling (M questions out of N pool)
        Collections.shuffle(poolList);
        List<Question> sampled = poolList.subList(0, Math.min(targetCount, poolList.size()));

        List<Map<String, Object>> questionsResponse = new ArrayList<>();
        for (Question q : sampled) {
            Map<String, Object> qMap = new LinkedHashMap<>();
            qMap.put("id", q.getId());
            qMap.put("title", q.getTitle());
            qMap.put("description", q.getDescription());
            qMap.put("questionType", q.getQuestionType() != null ? q.getQuestionType() : "MULTIPLE_CHOICE");
            qMap.put("difficulty", q.getDifficulty() != null ? q.getDifficulty() : "EASY");
            
            String skillLabel = q.getSkillId() != null && skillIdToName.containsKey(q.getSkillId())
                    ? skillIdToName.get(q.getSkillId()) : "Core Technical";
            qMap.put("skillName", skillLabel);

            // Fetch and shuffle options - do NOT expose isCorrect to the client
            List<QuestionOption> options = questionOptionRepository.findByQuestionId(q.getId());
            List<QuestionOption> shuffledOptions = new ArrayList<>(options);
            Collections.shuffle(shuffledOptions);

            List<Map<String, Object>> optionsList = new ArrayList<>();
            for (int i = 0; i < shuffledOptions.size(); i++) {
                QuestionOption opt = shuffledOptions.get(i);
                Map<String, Object> optMap = new LinkedHashMap<>();
                optMap.put("id", opt.getId());
                optMap.put("optionText", opt.getOptionText());
                optMap.put("displayOrder", i + 1);
                optionsList.add(optMap);
            }
            qMap.put("options", optionsList);
            questionsResponse.add(qMap);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("poolSize", totalPoolSize);
        response.put("sampledCount", questionsResponse.size());
        response.put("targetSkills", skillNames);
        response.put("questions", questionsResponse);
        return response;
    }

    /**
     * Evaluates the student's answers, computes per-skill accuracy,
     * and automatically sets StudentSkill.verified = true for passed skills.
     */
    @Transactional
    public Map<String, Object> evaluateVerificationQuiz(UUID userId, List<Map<String, Object>> answers, List<String> requestedSkills) {
        if (answers == null) {
            answers = Collections.emptyList();
        }

        int totalQuestions = answers.size();
        int correctCount = 0;

        Map<String, Integer> skillTotal = new HashMap<>();
        Map<String, Integer> skillCorrect = new HashMap<>();
        List<Map<String, Object>> questionEvaluations = new ArrayList<>();

        Map<UUID, String> skillIdToName = skillRepository.findAllActive().stream()
                .collect(Collectors.toMap(Skill::getId, Skill::getName, (a, b) -> a));

        for (Map<String, Object> ans : answers) {
            String qIdStr = (String) ans.get("questionId");
            String selectedOptIdStr = (String) ans.get("selectedOptionId");

            if (qIdStr == null) continue;
            UUID questionId = UUID.fromString(qIdStr);
            UUID selectedOptId = selectedOptIdStr != null && !selectedOptIdStr.isBlank() ? UUID.fromString(selectedOptIdStr) : null;

            Optional<Question> qOpt = questionRepository.findById(questionId);
            if (qOpt.isEmpty()) continue;
            Question q = qOpt.get();

            List<QuestionOption> options = questionOptionRepository.findByQuestionId(questionId);
            QuestionOption correctOption = options.stream().filter(QuestionOption::isCorrect).findFirst().orElse(null);

            boolean isCorrect = correctOption != null && selectedOptId != null && correctOption.getId().equals(selectedOptId);
            if (isCorrect) {
                correctCount++;
            }

            String skillName = q.getSkillId() != null && skillIdToName.containsKey(q.getSkillId())
                    ? skillIdToName.get(q.getSkillId()) : "Core Technical";

            skillTotal.put(skillName, skillTotal.getOrDefault(skillName, 0) + 1);
            if (isCorrect) {
                skillCorrect.put(skillName, skillCorrect.getOrDefault(skillName, 0) + 1);
            }

            Map<String, Object> eval = new LinkedHashMap<>();
            eval.put("questionId", questionId);
            eval.put("title", q.getTitle());
            eval.put("isCorrect", isCorrect);
            eval.put("correctOptionId", correctOption != null ? correctOption.getId() : null);
            eval.put("explanation", q.getExplanation());
            eval.put("skillName", skillName);
            questionEvaluations.add(eval);
        }

        double scorePercentage = totalQuestions > 0 ? ((double) correctCount / totalQuestions) * 100.0 : 0.0;
        boolean overallPassed = scorePercentage >= 60.0;

        List<String> verifiedSkills = new ArrayList<>();
        List<String> unverifiedSkills = new ArrayList<>();

        Set<String> allSkillsToEvaluate = new LinkedHashSet<>();
        if (requestedSkills != null) {
            allSkillsToEvaluate.addAll(requestedSkills);
        }
        allSkillsToEvaluate.addAll(skillTotal.keySet());

        for (String sk : allSkillsToEvaluate) {
            int total = skillTotal.getOrDefault(sk, 0);
            int correct = skillCorrect.getOrDefault(sk, 0);

            boolean skillPassed = (total > 0 && ((double) correct / total) >= 0.5) || (overallPassed);
            if (skillPassed) {
                verifiedSkills.add(sk);
                if (userId != null) {
                    persistSkillVerification(userId, sk);
                }
            } else {
                unverifiedSkills.add(sk);
            }
        }

        int earnedXp = verifiedSkills.size() * 50;
        int earnedCoins = overallPassed ? 20 : 5;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("score", correctCount);
        result.put("total", totalQuestions);
        result.put("percentage", Math.round(scorePercentage * 10.0) / 10.0);
        result.put("passed", overallPassed);
        result.put("verifiedSkills", verifiedSkills);
        result.put("unverifiedSkills", unverifiedSkills);
        result.put("earnedXp", earnedXp);
        result.put("earnedCoins", earnedCoins);
        result.put("questionResults", questionEvaluations);
        return result;
    }

    private void persistSkillVerification(UUID userId, String skillName) {
        try {
            Optional<StudentSkill> existingOpt = studentSkillRepository.findByUserIdAndSkillNameIgnoreCase(userId, skillName);
            if (existingOpt.isPresent()) {
                StudentSkill s = existingOpt.get();
                s.setVerified(true);
                s.setSource("ONBOARDING_VERIFIED");
                studentSkillRepository.save(s);
            } else {
                StudentSkill newSkill = new StudentSkill();
                newSkill.setUserId(userId);
                newSkill.setSkillName(skillName);
                newSkill.setProficiency(SkillProficiency.INTERMEDIATE);
                newSkill.setCategory("Technical");
                newSkill.setVerified(true);
                newSkill.setSource("ONBOARDING_VERIFIED");
                studentSkillRepository.save(newSkill);
            }
        } catch (Exception e) {
            // Non-fatal fallback
        }
    }
}
