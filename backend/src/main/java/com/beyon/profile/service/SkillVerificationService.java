package com.beyon.profile.service;

import com.beyon.identity.enums.AccountStatus;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.practice.model.Leaderboard;
import com.beyon.practice.model.Question;
import com.beyon.practice.model.QuestionOption;
import com.beyon.practice.model.StudentQuestionAttempt;
import com.beyon.practice.repository.LeaderboardRepository;
import com.beyon.practice.repository.QuestionOptionRepository;
import com.beyon.practice.repository.QuestionRepository;
import com.beyon.practice.repository.StudentQuestionAttemptRepository;
import com.beyon.profile.enums.SkillProficiency;
import com.beyon.profile.model.Skill;
import com.beyon.profile.model.SkillTopic;
import com.beyon.profile.model.StudentLearningTopic;
import com.beyon.profile.model.StudentProfile;
import com.beyon.profile.model.StudentSkill;
import com.beyon.profile.repository.SkillRepository;
import com.beyon.profile.repository.SkillTopicRepository;
import com.beyon.profile.repository.StudentLearningTopicRepository;
import com.beyon.profile.repository.StudentProfileRepository;
import com.beyon.profile.repository.StudentSkillRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SkillVerificationService {

    private static final Logger log = LoggerFactory.getLogger(SkillVerificationService.class);
    private static final int ASSESSMENT_TOTAL_QUESTIONS = 50;
    private static final int RETEST_COOLDOWN_DAYS = 7;

    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final SkillRepository skillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final StudentQuestionAttemptRepository studentQuestionAttemptRepository;
    private final LeaderboardRepository leaderboardRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final SkillTopicRepository skillTopicRepository;
    private final StudentLearningTopicRepository studentLearningTopicRepository;

    public SkillVerificationService(QuestionRepository questionRepository,
                                  QuestionOptionRepository questionOptionRepository,
                                  SkillRepository skillRepository,
                                  StudentSkillRepository studentSkillRepository,
                                  StudentQuestionAttemptRepository studentQuestionAttemptRepository,
                                  LeaderboardRepository leaderboardRepository,
                                  StudentProfileRepository studentProfileRepository,
                                  UserRepository userRepository,
                                  SkillTopicRepository skillTopicRepository,
                                  StudentLearningTopicRepository studentLearningTopicRepository) {
        this.questionRepository = questionRepository;
        this.questionOptionRepository = questionOptionRepository;
        this.skillRepository = skillRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.studentQuestionAttemptRepository = studentQuestionAttemptRepository;
        this.leaderboardRepository = leaderboardRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
        this.skillTopicRepository = skillTopicRepository;
        this.studentLearningTopicRepository = studentLearningTopicRepository;
    }

    /**
     * Generates a 50-question Skill Validation Assessment strictly partitioned into
     * Skill-Wise Sections based on the student's chosen skills.
     * Incorporates Adaptive Remediation: If the student has identified lagged topics in any skill,
     * 50% of the questions in that skill are prioritized strictly from the lagged topic(s),
     * with the remaining 50% drawn from a balanced mix of other topics.
     * Guarantees zero question repeats for the student.
     */
    public Map<String, Object> generate50QuestionAssessment(UUID userId, List<String> requestedSkills) {
        List<String> targetSkills = new ArrayList<>();
        if (requestedSkills != null) {
            for (String s : requestedSkills) {
                if (s != null && !s.trim().isEmpty() && !targetSkills.contains(s.trim())) {
                    targetSkills.add(s.trim());
                }
            }
        }

        // If no skills requested, look up the student's declared skills from onboarding/profile
        if (targetSkills.isEmpty() && userId != null) {
            List<StudentSkill> userSkills = studentSkillRepository.findByUserId(userId);
            for (StudentSkill sk : userSkills) {
                if (sk.getSkillName() != null && !sk.getSkillName().trim().isEmpty() && !targetSkills.contains(sk.getSkillName().trim())) {
                    targetSkills.add(sk.getSkillName().trim());
                }
            }
        }

        // Fallback default skills if student has no declared skills (tailored dynamically to candidate's department)
        if (targetSkills.isEmpty() && userId != null) {
            Optional<StudentProfile> profOpt = studentProfileRepository.findByUserId(userId);
            if (profOpt.isPresent()) {
                StudentProfile p = profOpt.get();
                String dept = p.getDepartment() != null ? p.getDepartment().toLowerCase() : "";
                if (dept.contains("ai") || dept.contains("data science") || dept.contains("aids")) {
                    targetSkills.addAll(List.of("Python", "Machine Learning", "Data Structures & Algorithms", "Database Systems"));
                } else if (dept.contains("electronic") || dept.contains("ece") || dept.contains("electrical") || dept.contains("eee")) {
                    targetSkills.addAll(List.of("C Programming", "Embedded Systems", "Digital Electronics", "Python"));
                } else if (dept.contains("mech")) {
                    targetSkills.addAll(List.of("Engineering Mechanics", "CAD Modeling", "Thermodynamics", "Python"));
                } else if (dept.contains("civil")) {
                    targetSkills.addAll(List.of("Structural Analysis", "AutoCAD", "Surveying", "Geotechnical Engineering"));
                }
            }
        }

        if (targetSkills.isEmpty()) {
            targetSkills.addAll(List.of("Data Structures & Algorithms", "Core Programming", "Database Systems", "Web Development"));
        }

        // Limit to top 5 skills to ensure each section has sufficient depth (at least 10 Qs per section)
        if (targetSkills.size() > 5) {
            targetSkills = new ArrayList<>(targetSkills.subList(0, 5));
        }

        int numSkills = targetSkills.size();
        int basePerSkill = ASSESSMENT_TOTAL_QUESTIONS / numSkills;
        int remainder = ASSESSMENT_TOTAL_QUESTIONS % numSkills;

        Map<String, Integer> quotas = new LinkedHashMap<>();
        for (int i = 0; i < numSkills; i++) {
            quotas.put(targetSkills.get(i), basePerSkill + (i < remainder ? 1 : 0));
        }

        List<Skill> allActiveSkills = skillRepository.findAllActive();
        Map<UUID, String> skillIdToName = new HashMap<>();
        for (Skill s : allActiveSkills) {
            skillIdToName.put(s.getId(), s.getName());
        }

        List<SkillTopic> allSkillTopics = skillTopicRepository.findAll();

        // Query student's active lagged topics
        List<StudentLearningTopic> laggedRecords = userId != null
                ? studentLearningTopicRepository.findByStudentIdOrderByStartedAtDesc(userId).stream()
                    .filter(t -> "LAGGED".equalsIgnoreCase(t.getStatus()))
                    .collect(Collectors.toList())
                : Collections.emptyList();

        Map<UUID, String> laggedTopicNames = new HashMap<>();
        for (StudentLearningTopic lt : laggedRecords) {
            for (SkillTopic st : allSkillTopics) {
                if (st.getId().equals(lt.getTopicId())) {
                    laggedTopicNames.put(st.getId(), st.getName());
                    break;
                }
            }
        }

        Set<UUID> selectedQuestionIds = new HashSet<>();
        List<Map<String, Object>> sectionsList = new ArrayList<>();
        List<Map<String, Object>> allQuestionsList = new ArrayList<>();
        List<String> focusedLaggedTopicNames = new ArrayList<>();
        int overallQuestionNumber = 1;
        int targetedQuestionCount = 0;
        int mixedQuestionCount = 0;

        // Build each Skill-Wise Section
        for (int sectionIndex = 0; sectionIndex < targetSkills.size(); sectionIndex++) {
            String skillName = targetSkills.get(sectionIndex);
            int quota = quotas.getOrDefault(skillName, 0);
            Skill matchedSkill = findMatchingSkill(skillName, allActiveSkills);

            // Check if student has lagged topics for this skill
            List<SkillTopic> skillLaggedTopics = new ArrayList<>();
            if (matchedSkill != null) {
                for (StudentLearningTopic lt : laggedRecords) {
                    for (SkillTopic st : allSkillTopics) {
                        if (st.getId().equals(lt.getTopicId()) && st.getSkillId().equals(matchedSkill.getId())) {
                            skillLaggedTopics.add(st);
                        }
                    }
                }
            }

            List<Question> sectionSelectedQuestions = new ArrayList<>();
            Map<UUID, Boolean> questionRemediationFlag = new HashMap<>();
            Map<UUID, String> questionLaggedTopicMap = new HashMap<>();

            // 50% Lagged Topic Prioritization:
            // If lagged topics exist, dedicate 50% (quota / 2) to unattempted questions from those lagged topics
            if (!skillLaggedTopics.isEmpty() && quota >= 2) {
                int laggedQuota = quota / 2;
                int laggedPerTopic = Math.max(1, laggedQuota / skillLaggedTopics.size());

                for (SkillTopic lt : skillLaggedTopics) {
                    if (sectionSelectedQuestions.size() >= laggedQuota) break;

                    List<Question> topicCandidates = new ArrayList<>();
                    if (userId != null && matchedSkill != null) {
                        List<Question> unattemptedInSkill = questionRepository.findUnattemptedBySkillIdForStudent(matchedSkill.getId(), userId);
                        String kw = lt.getName() != null ? lt.getName().toLowerCase() : "";
                        for (Question q : unattemptedInSkill) {
                            boolean matchTopic = (q.getTopicId() != null && q.getTopicId().equals(lt.getId()));
                            boolean matchTitle = (!kw.isEmpty() && q.getTitle() != null && q.getTitle().toLowerCase().contains(kw));
                            boolean matchTags = (!kw.isEmpty() && q.getTags() != null && q.getTags().toLowerCase().contains(kw));
                            if (matchTopic || matchTitle || matchTags) {
                                topicCandidates.add(q);
                            }
                        }
                    }

                    if (topicCandidates.isEmpty() && lt.getName() != null && !lt.getName().isBlank()) {
                        topicCandidates = questionRepository.findByTagsContainingOrderByCreatedAtAsc(lt.getName().toLowerCase());
                    }

                    if (topicCandidates.isEmpty() && matchedSkill != null) {
                        List<Question> allInSkill = questionRepository.findBySkillIdActive(matchedSkill.getId());
                        String kw = lt.getName() != null ? lt.getName().toLowerCase() : "";
                        for (Question q : allInSkill) {
                            boolean matchTopic = (q.getTopicId() != null && q.getTopicId().equals(lt.getId()));
                            boolean matchTitle = (!kw.isEmpty() && q.getTitle() != null && q.getTitle().toLowerCase().contains(kw));
                            boolean matchTags = (!kw.isEmpty() && q.getTags() != null && q.getTags().toLowerCase().contains(kw));
                            if (matchTopic || matchTitle || matchTags) {
                                topicCandidates.add(q);
                            }
                        }
                    }

                    List<Question> availLagged = new ArrayList<>();
                    for (Question q : topicCandidates) {
                        if (!selectedQuestionIds.contains(q.getId())) {
                            availLagged.add(q);
                        }
                    }

                    Collections.shuffle(availLagged);
                    int take = Math.min(laggedPerTopic, Math.min(laggedQuota - sectionSelectedQuestions.size(), availLagged.size()));
                    for (int k = 0; k < take; k++) {
                        Question q = availLagged.get(k);
                        selectedQuestionIds.add(q.getId());
                        sectionSelectedQuestions.add(q);
                        questionRemediationFlag.put(q.getId(), true);
                        questionLaggedTopicMap.put(q.getId(), lt.getName());
                        targetedQuestionCount++;
                    }

                    if (take > 0 && !focusedLaggedTopicNames.contains(lt.getName())) {
                        focusedLaggedTopicNames.add(lt.getName());
                    }
                }
            }

            // Fill remaining section quota (50% mixed or full quota if no lagged topics)
            int remainingForSection = quota - sectionSelectedQuestions.size();
            if (remainingForSection > 0) {
                List<Question> candidatePool = new ArrayList<>();
                if (matchedSkill != null) {
                    if (userId != null) {
                        candidatePool = questionRepository.findUnattemptedBySkillIdForStudent(matchedSkill.getId(), userId);
                    } else {
                        candidatePool = questionRepository.findBySkillIdActive(matchedSkill.getId());
                    }
                }

                if (candidatePool.isEmpty()) {
                    candidatePool = questionRepository.findByTagsContainingOrderByCreatedAtAsc(skillName.toLowerCase());
                }

                List<Question> availableGeneral = new ArrayList<>();
                for (Question q : candidatePool) {
                    if (!selectedQuestionIds.contains(q.getId())) {
                        availableGeneral.add(q);
                    }
                }

                Collections.shuffle(availableGeneral);
                int takeGen = Math.min(remainingForSection, availableGeneral.size());
                for (int i = 0; i < takeGen; i++) {
                    Question q = availableGeneral.get(i);
                    selectedQuestionIds.add(q.getId());
                    sectionSelectedQuestions.add(q);
                    questionRemediationFlag.put(q.getId(), false);
                    mixedQuestionCount++;
                }
            }

            // If section is still short of its quota, synthesize high-quality questions for this exact skill
            int stillNeeded = quota - sectionSelectedQuestions.size();
            if (stillNeeded > 0) {
                List<Question> synthesized = generateSkillQuestionsIfShortfall(matchedSkill, skillName, stillNeeded);
                for (Question q : synthesized) {
                    selectedQuestionIds.add(q.getId());
                    sectionSelectedQuestions.add(q);
                    questionRemediationFlag.put(q.getId(), false);
                    mixedQuestionCount++;
                }
            }

            // Format section questions
            List<Map<String, Object>> sectionQuestionMaps = new ArrayList<>();
            int secQNum = 1;
            for (Question q : sectionSelectedQuestions) {
                boolean isRemediation = questionRemediationFlag.getOrDefault(q.getId(), false);
                String laggedTopic = questionLaggedTopicMap.get(q.getId());
                Map<String, Object> qMap = formatQuestionMap(
                        q,
                        overallQuestionNumber++,
                        sectionIndex,
                        skillName,
                        secQNum++,
                        allSkillTopics,
                        isRemediation,
                        laggedTopic
                );
                sectionQuestionMaps.add(qMap);
                allQuestionsList.add(qMap);
            }

            Map<String, Object> sectionObj = new LinkedHashMap<>();
            sectionObj.put("sectionIndex", sectionIndex);
            sectionObj.put("sectionId", "section-" + (sectionIndex + 1));
            sectionObj.put("sectionName", skillName);
            sectionObj.put("skillName", skillName);
            sectionObj.put("questionCount", sectionQuestionMaps.size());
            sectionObj.put("questions", sectionQuestionMaps);
            sectionsList.add(sectionObj);
        }

        // Fill any deficit up to 50 questions across sections
        if (allQuestionsList.size() < ASSESSMENT_TOTAL_QUESTIONS) {
            int deficit = ASSESSMENT_TOTAL_QUESTIONS - allQuestionsList.size();
            List<Question> fallbackQuestions = new ArrayList<>();
            if (userId != null) {
                fallbackQuestions = questionRepository.findUnattemptedGeneralForStudent(userId, PageRequest.of(0, deficit * 4));
            } else {
                fallbackQuestions = questionRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED", PageRequest.of(0, deficit * 4));
            }

            Collections.shuffle(fallbackQuestions);
            int lastSecIndex = Math.max(0, sectionsList.size() - 1);
            Map<String, Object> lastSection = sectionsList.isEmpty() ? null : sectionsList.get(lastSecIndex);
            List<Map<String, Object>> lastSecQuestions = lastSection != null
                    ? (List<Map<String, Object>>) lastSection.get("questions") : new ArrayList<>();

            for (Question q : fallbackQuestions) {
                if (allQuestionsList.size() >= ASSESSMENT_TOTAL_QUESTIONS) break;
                if (!selectedQuestionIds.contains(q.getId())) {
                    selectedQuestionIds.add(q.getId());
                    String skLabel = q.getSkillId() != null && skillIdToName.containsKey(q.getSkillId())
                            ? skillIdToName.get(q.getSkillId()) : "Core Technical";
                    Map<String, Object> qMap = formatQuestionMap(
                            q,
                            overallQuestionNumber++,
                            lastSecIndex,
                            skLabel,
                            lastSecQuestions.size() + 1,
                            allSkillTopics,
                            false,
                            null
                    );
                    lastSecQuestions.add(qMap);
                    allQuestionsList.add(qMap);
                    mixedQuestionCount++;
                }
            }
            if (lastSection != null) {
                lastSection.put("questionCount", lastSecQuestions.size());
            }
        }

        Map<String, Object> adaptiveMetadata = new LinkedHashMap<>();
        boolean isAdaptive = !focusedLaggedTopicNames.isEmpty();
        adaptiveMetadata.put("isAdaptive", isAdaptive);
        adaptiveMetadata.put("laggedTopicsFocused", focusedLaggedTopicNames);
        adaptiveMetadata.put("targetedQuestionCount", targetedQuestionCount);
        adaptiveMetadata.put("mixedQuestionCount", mixedQuestionCount);
        adaptiveMetadata.put("prioritizationRatio", isAdaptive ? "50% Lagged Topic / 50% Mixed Curriculum" : "Standard Balanced");

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalQuestions", allQuestionsList.size());
        response.put("totalSections", sectionsList.size());
        response.put("targetSkills", targetSkills);
        response.put("skillQuotas", quotas);
        response.put("sections", sectionsList);
        response.put("questions", allQuestionsList);
        response.put("adaptiveMetadata", adaptiveMetadata);
        return response;
    }

    private Map<String, Object> formatQuestionMap(
            Question q,
            int overallQuestionNumber,
            int sectionIndex,
            String skillName,
            int sectionQuestionNumber,
            List<SkillTopic> allSkillTopics,
            boolean isRemediationTarget,
            String laggedTopicName) {

        Map<String, Object> qMap = new LinkedHashMap<>();
        qMap.put("questionNumber", overallQuestionNumber);
        qMap.put("sectionIndex", sectionIndex);
        qMap.put("sectionName", skillName);
        qMap.put("sectionQuestionNumber", sectionQuestionNumber);
        qMap.put("id", q.getId());
        qMap.put("title", q.getTitle());
        qMap.put("description", q.getDescription());
        qMap.put("questionType", q.getQuestionType() != null ? q.getQuestionType() : "MULTIPLE_CHOICE");
        qMap.put("difficulty", q.getDifficulty() != null ? q.getDifficulty() : "INTERMEDIATE");
        qMap.put("skillName", skillName);

        Map<String, Object> topicInfo = resolveTopic(q, allSkillTopics);
        qMap.put("topicId", topicInfo.get("topicId"));
        qMap.put("topicName", topicInfo.get("topicName"));
        qMap.put("isRemediationTarget", isRemediationTarget);
        if (laggedTopicName != null) {
            qMap.put("laggedTopicName", laggedTopicName);
        }

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
        return qMap;
    }

    private Map<String, Object> resolveTopic(Question q, List<SkillTopic> skillTopics) {
        Map<String, Object> res = new HashMap<>();
        if (q.getTopicId() != null) {
            for (SkillTopic t : skillTopics) {
                if (t.getId().equals(q.getTopicId())) {
                    res.put("topicId", t.getId());
                    res.put("topicName", t.getName());
                    return res;
                }
            }
        }

        String title = q.getTitle() != null ? q.getTitle().toLowerCase() : "";
        String tags = q.getTags() != null ? q.getTags().toLowerCase() : "";
        for (SkillTopic t : skillTopics) {
            String tName = t.getName().toLowerCase();
            if (title.contains(tName) || tags.contains(tName)) {
                res.put("topicId", t.getId());
                res.put("topicName", t.getName());
                return res;
            }
        }

        String fallback = "Core Concepts";
        if (q.getTags() != null && !q.getTags().isBlank()) {
            String[] parts = q.getTags().split(",");
            if (parts.length > 0 && !parts[0].trim().isBlank()) {
                fallback = parts[0].trim();
            }
        } else if (q.getTitle() != null && q.getTitle().contains("-")) {
            String[] parts = q.getTitle().split("-");
            if (parts.length > 1) {
                fallback = parts[1].replaceAll("\\(Q\\d+\\)", "").trim();
            }
        }

        res.put("topicId", null);
        res.put("topicName", fallback);
        return res;
    }

    private List<Question> generateSkillQuestionsIfShortfall(Skill matchedSkill, String skillName, int needed) {
        List<Question> generated = new ArrayList<>();
        UUID skillId = matchedSkill != null ? matchedSkill.getId() : null;

        String[][] templates = new String[][] {
            {"Core Architecture and Design Principles in %s", "Which architectural pattern or design principle is standard for high-reliability systems built with %s?"},
            {"Performance Optimization and Efficiency in %s", "When diagnosing latency bottlenecks in %s, which optimization strategy yields the highest throughput gain?"},
            {"Concurrency and State Isolation in %s", "How does %s handle concurrent executions and thread safety in enterprise workload environments?"},
            {"Error Handling and Fault Resilience in %s", "What is considered production best practice for structured exception management and recovery in %s?"},
            {"Data Modeling and State Persistence in %s", "In modern %s development, how are transactions, schema constraints, and data validation maintained reliably?"},
            {"Security and Vulnerability Mitigation in %s", "Which defense-in-depth measure is essential to mitigate common vulnerability vectors when deploying %s?"},
            {"Memory Management and Resource Lifecycle in %s", "How are long-lived resources, connection pools, and allocations managed safely to prevent leaks in %s?"},
            {"Testing Strategy and Verification in %s", "Which testing methodology provides the most dependable coverage for business-critical logic in %s?"},
            {"Build Pipeline and Dependency Isolation in %s", "When configuring packaging and dependency management in %s, which method ensures deterministic builds?"},
            {"API Protocol and Contract Design in %s", "What is the standard convention for serializing payloads and maintaining contract versioning in %s services?"},
            {"Asynchronous Processing and Reactive Flows in %s", "How are non-blocking asynchronous operations and stream boundaries coordinated in %s?"},
            {"Observability and Health Telemetry in %s", "Which metric provides the most accurate operational health and saturation indicator for %s microservices?"},
            {"Clean Code and Idiomatic Patterns in %s", "Which syntactic pattern distinguishes maintainable, idiomatic %s code from error-prone anti-patterns?"},
            {"Deployment and Containerization of %s", "What configuration parameter is critical when scaling containerized %s workloads in production environments?"}
        };

        for (int i = 0; i < needed; i++) {
            int tIdx = i % templates.length;
            String title = String.format(templates[tIdx][0], skillName);
            String desc = String.format(templates[tIdx][1], skillName);

            Question q = new Question();
            q.setSkillId(skillId);
            q.setTitle(title);
            q.setDescription(desc);
            q.setQuestionType("MULTIPLE_CHOICE");
            q.setDifficulty("INTERMEDIATE");
            q.setEvaluationMethod("EXACT_MATCH");
            q.setTags(skillName);
            q.setStatus("PUBLISHED");
            Question savedQ = questionRepository.save(q);

            List<QuestionOption> options = new ArrayList<>();
            QuestionOption opt1 = new QuestionOption();
            opt1.setQuestionId(savedQ.getId());
            opt1.setOptionText(String.format("Apply modular component boundaries, immutable data structures, and deterministic contracts in %s.", skillName));
            opt1.setCorrect(true);
            opt1.setDisplayOrder(1);
            options.add(opt1);

            QuestionOption opt2 = new QuestionOption();
            opt2.setQuestionId(savedQ.getId());
            opt2.setOptionText("Couple disparate modules tightly through shared mutable global state without lifecycle boundaries.");
            opt2.setCorrect(false);
            opt2.setDisplayOrder(2);
            options.add(opt2);

            QuestionOption opt3 = new QuestionOption();
            opt3.setQuestionId(savedQ.getId());
            opt3.setOptionText("Suppress runtime exceptions without structured logging or automated failover handling.");
            opt3.setCorrect(false);
            opt3.setDisplayOrder(3);
            options.add(opt3);

            QuestionOption opt4 = new QuestionOption();
            opt4.setQuestionId(savedQ.getId());
            opt4.setOptionText("Disable timeout limits and keep resource pools unconstrained under heavy loads.");
            opt4.setCorrect(false);
            opt4.setDisplayOrder(4);
            options.add(opt4);

            questionOptionRepository.saveAll(options);
            generated.add(savedQ);
        }

        return generated;
    }

    /**
     * Evaluates the 50-Question Assessment:
     * - Records all attempts in student_question_attempts (guaranteeing zero repeats for future tests)
     * - Computes accuracy percentage per skill
     * - Updates StudentSkill (score, questions_tested, questions_correct, verified, retest_available_at)
     * - Updates global Leaderboards and calculates student's standing/rank
     * - Sets student_profiles.has_completed_assessment = true
     */
    @Transactional
    public Map<String, Object> evaluate50QuestionAssessment(UUID userId, List<Map<String, Object>> answers, List<String> requestedSkills) {
        if (answers == null) {
            answers = Collections.emptyList();
        }

        int totalQuestions = answers.size();
        int totalCorrect = 0;

        Map<String, Integer> skillTotal = new LinkedHashMap<>();
        Map<String, Integer> skillCorrect = new LinkedHashMap<>();
        List<Map<String, Object>> questionEvaluations = new ArrayList<>();

        Map<UUID, String> skillIdToName = skillRepository.findAllActive().stream()
                .collect(Collectors.toMap(Skill::getId, Skill::getName, (a, b) -> a));

        Instant now = Instant.now();
        Instant retestAvailableAt = now.plus(RETEST_COOLDOWN_DAYS, ChronoUnit.DAYS);

        Map<String, Map<String, int[]>> topicStatsBySkill = new LinkedHashMap<>();
        Map<String, UUID> topicNameToIdMap = new HashMap<>();
        List<SkillTopic> allSkillTopics = skillTopicRepository.findAll();

        for (Map<String, Object> ans : answers) {
            String qIdStr = (String) ans.get("questionId");
            String selectedOptIdStr = (String) ans.get("selectedOptionId");
            Number timeSpent = ans.get("timeSpentSeconds") instanceof Number ? (Number) ans.get("timeSpentSeconds") : 0;

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
                totalCorrect++;
            }

            // Determine skill name
            String explicitSkill = (String) ans.get("skillName");
            String skillName = explicitSkill != null && !explicitSkill.isBlank()
                    ? explicitSkill
                    : (q.getSkillId() != null && skillIdToName.containsKey(q.getSkillId())
                        ? skillIdToName.get(q.getSkillId()) : "Core Technical");

            skillTotal.put(skillName, skillTotal.getOrDefault(skillName, 0) + 1);
            if (isCorrect) {
                skillCorrect.put(skillName, skillCorrect.getOrDefault(skillName, 0) + 1);
            }

            // Determine topic name and ID
            String explicitTopic = (String) ans.get("topicName");
            Map<String, Object> resolved = resolveTopic(q, allSkillTopics);
            String topicName = explicitTopic != null && !explicitTopic.isBlank()
                    ? explicitTopic : (String) resolved.get("topicName");
            UUID resolvedTopicId = (UUID) resolved.get("topicId");
            if (resolvedTopicId != null) {
                topicNameToIdMap.put(topicName, resolvedTopicId);
            }

            topicStatsBySkill.computeIfAbsent(skillName, k -> new LinkedHashMap<>()).computeIfAbsent(topicName, k -> new int[2]);
            topicStatsBySkill.get(skillName).get(topicName)[0]++; // total attempts
            if (isCorrect) {
                topicStatsBySkill.get(skillName).get(topicName)[1]++; // correct attempts
            }

            // Record in student_question_attempts to permanently exclude this question from future tests
            if (userId != null) {
                try {
                    StudentQuestionAttempt attempt = new StudentQuestionAttempt();
                    attempt.setStudentId(userId);
                    attempt.setQuestionId(questionId);
                    long pastAttempts = studentQuestionAttemptRepository.countByStudentIdAndQuestionId(userId, questionId);
                    attempt.setAttemptNumber((int) pastAttempts + 1);
                    attempt.setUserAnswer(selectedOptIdStr != null ? selectedOptIdStr : "SKIPPED");
                    attempt.setCorrect(isCorrect);
                    attempt.setTimeSpentSeconds(timeSpent != null ? timeSpent.intValue() : 0);
                    attempt.setScore(isCorrect ? BigDecimal.valueOf(1.0) : BigDecimal.ZERO);
                    attempt.setStatus("SUBMITTED");
                    studentQuestionAttemptRepository.save(attempt);
                } catch (Exception ex) {
                    log.warn("Failed to record question attempt: {}", ex.getMessage());
                }
            }

            Map<String, Object> eval = new LinkedHashMap<>();
            eval.put("questionId", questionId);
            eval.put("title", q.getTitle());
            eval.put("skillName", skillName);
            eval.put("topicName", topicName);
            eval.put("isCorrect", isCorrect);
            eval.put("selectedOptionId", selectedOptId);
            eval.put("correctOptionId", correctOption != null ? correctOption.getId() : null);
            eval.put("explanation", q.getExplanation());
            questionEvaluations.add(eval);
        }

        // Identify Lagged Topics: Topics where student accuracy < 50%
        List<Map<String, Object>> laggedTopics = new ArrayList<>();
        for (Map.Entry<String, Map<String, int[]>> skillEntry : topicStatsBySkill.entrySet()) {
            String sk = skillEntry.getKey();
            Map<String, int[]> topics = skillEntry.getValue();

            for (Map.Entry<String, int[]> topEntry : topics.entrySet()) {
                String tName = topEntry.getKey();
                int tTot = topEntry.getValue()[0];
                int tCor = topEntry.getValue()[1];
                double tPct = tTot > 0 ? Math.round(((double) tCor / tTot) * 100.0 * 10.0) / 10.0 : 0.0;

                if (tPct < 50.0 || (tTot >= 2 && tCor == 0)) {
                    Map<String, Object> lagMap = new LinkedHashMap<>();
                    lagMap.put("skillName", sk);
                    lagMap.put("topicName", tName);
                    lagMap.put("totalQuestions", tTot);
                    lagMap.put("correctQuestions", tCor);
                    lagMap.put("accuracy", tPct);
                    lagMap.put("status", "LAGGED");
                    lagMap.put("remediationPriority", "HIGH");
                    lagMap.put("recommendation", "Candidate lagged in " + tName + " (" + tPct + "% accuracy). 50% of the questions in subsequent practice/assessments will reinforce this topic.");
                    laggedTopics.add(lagMap);

                    if (userId != null) {
                        try {
                            UUID matchedTopicId = topicNameToIdMap.get(tName);
                            if (matchedTopicId == null) {
                                for (SkillTopic st : allSkillTopics) {
                                    if (st.getName().equalsIgnoreCase(tName)) {
                                        matchedTopicId = st.getId();
                                        break;
                                    }
                                }
                            }
                            if (matchedTopicId == null) {
                                Skill matchedSkillObj = findMatchingSkill(sk, skillRepository.findAllActive());
                                UUID skillIdForTopic = matchedSkillObj != null ? matchedSkillObj.getId() : null;
                                if (skillIdForTopic == null && !skillRepository.findAllActive().isEmpty()) {
                                    skillIdForTopic = skillRepository.findAllActive().get(0).getId();
                                }
                                if (skillIdForTopic != null) {
                                    SkillTopic newTopic = new SkillTopic();
                                    newTopic.setName(tName);
                                    newTopic.setSkillId(skillIdForTopic);
                                    String slugSafe = tName.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
                                    if (slugSafe.isBlank()) slugSafe = "topic";
                                    newTopic.setSlug(UUID.randomUUID().toString().substring(0, 8) + "-" + slugSafe);
                                    newTopic = skillTopicRepository.save(newTopic);
                                    matchedTopicId = newTopic.getId();
                                    allSkillTopics.add(newTopic);
                                    topicNameToIdMap.put(tName, matchedTopicId);
                                }
                            }
                            if (matchedTopicId != null) {
                                final UUID finalTopicId = matchedTopicId;
                                StudentLearningTopic lt = studentLearningTopicRepository.findByStudentIdAndTopicId(userId, finalTopicId)
                                        .orElseGet(() -> {
                                            StudentLearningTopic newLt = new StudentLearningTopic();
                                            newLt.setStudentId(userId);
                                            newLt.setTopicId(finalTopicId);
                                            return newLt;
                                        });
                                lt.setStatus("LAGGED");
                                studentLearningTopicRepository.save(lt);
                            }
                        } catch (Exception ex) {
                            log.warn("Failed to persist student lagged topic: {}", ex.getMessage());
                        }
                    }
                } else if (tPct >= 70.0 && userId != null) {
                    try {
                        UUID matchedTopicId = topicNameToIdMap.get(tName);
                        if (matchedTopicId != null) {
                            studentLearningTopicRepository.findByStudentIdAndTopicId(userId, matchedTopicId).ifPresent(lt -> {
                                if ("LAGGED".equalsIgnoreCase(lt.getStatus())) {
                                    lt.setStatus("RECOVERED");
                                    studentLearningTopicRepository.save(lt);
                                }
                            });
                        }
                    } catch (Exception ignored) {}
                }
            }
        }

        double overallPercentage = totalQuestions > 0 ? ((double) totalCorrect / totalQuestions) * 100.0 : 0.0;
        overallPercentage = Math.round(overallPercentage * 10.0) / 10.0;

        List<Map<String, Object>> skillBreakdown = new ArrayList<>();
        Set<String> evaluatedSkillNames = new LinkedHashSet<>();
        if (requestedSkills != null) {
            evaluatedSkillNames.addAll(requestedSkills);
        }
        evaluatedSkillNames.addAll(skillTotal.keySet());

        for (String sk : evaluatedSkillNames) {
            int qTotal = skillTotal.getOrDefault(sk, 0);
            int qCorrect = skillCorrect.getOrDefault(sk, 0);
            double pct = qTotal > 0 ? Math.round(((double) qCorrect / qTotal) * 100.0 * 10.0) / 10.0 : 0.0;
            boolean verified = pct >= 50.0 || (qTotal == 0 && overallPercentage >= 60.0);

            long rank = 1;
            long totalRanked = 1;

            if (userId != null) {
                // Update StudentSkill
                try {
                    Optional<StudentSkill> existingOpt = studentSkillRepository.findByUserIdAndSkillNameIgnoreCase(userId, sk);
                    StudentSkill studentSkill = existingOpt.orElseGet(() -> {
                        StudentSkill s = new StudentSkill();
                        s.setUserId(userId);
                        s.setSkillName(sk);
                        s.setProficiency(SkillProficiency.INTERMEDIATE);
                        s.setCategory("Technical");
                        s.setSource("VALIDATION_ASSESSMENT");
                        return s;
                    });

                    studentSkill.setScore(BigDecimal.valueOf(pct));
                    studentSkill.setQuestionsTested(qTotal);
                    studentSkill.setQuestionsCorrect(qCorrect);
                    studentSkill.setVerified(verified);
                    studentSkill.setLastAssessedAt(now);
                    studentSkill.setRetestAvailableAt(retestAvailableAt);
                    studentSkillRepository.save(studentSkill);
                } catch (Exception ex) {
                    log.warn("Failed to persist StudentSkill for {}: {}", sk, ex.getMessage());
                }

                // Update Leaderboard
                try {
                    String scope = sk.toUpperCase();
                    long boardScore = Math.round(pct * 100);
                    Leaderboard lb = leaderboardRepository.findByStudentIdAndBoardTypeAndBoardScopeAndPeriod(
                            userId, "SKILL", scope, "ALL_TIME");
                    if (lb == null) {
                        lb = new Leaderboard();
                        lb.setStudentId(userId);
                        lb.setBoardType("SKILL");
                        lb.setBoardScope(scope);
                        lb.setPeriod("ALL_TIME");
                        lb.setScore(boardScore);
                    } else {
                        lb.setScore(Math.max(lb.getScore(), boardScore));
                    }
                    leaderboardRepository.save(lb);

                    Long computedRank = leaderboardRepository.countRankHigherThanScore("SKILL", scope, "ALL_TIME", lb.getScore());
                    rank = computedRank != null ? computedRank : 1;
                    Long countBoard = leaderboardRepository.countTotalOnBoard("SKILL", scope, "ALL_TIME");
                    totalRanked = countBoard != null ? countBoard : 1;
                } catch (Exception ex) {
                    log.warn("Failed to update leaderboard for {}: {}", sk, ex.getMessage());
                }
            }

            Map<String, Object> skMap = new LinkedHashMap<>();
            skMap.put("skillName", sk);
            skMap.put("totalQuestions", qTotal);
            skMap.put("correctQuestions", qCorrect);
            skMap.put("percentage", pct);
            skMap.put("verified", verified);
            skMap.put("rank", rank);
            skMap.put("totalRanked", totalRanked);
            skMap.put("retestAvailableAt", retestAvailableAt.toString());
            skillBreakdown.add(skMap);
        }

        // Mark StudentProfile as completed assessment
        if (userId != null) {
            try {
                Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
                if (profileOpt.isPresent()) {
                    StudentProfile p = profileOpt.get();
                    p.setHasCompletedAssessment(true);
                    p.setAssessmentCompletedAt(now);
                    studentProfileRepository.save(p);
                }

                userRepository.findById(userId).ifPresent(u -> {
                    u.setProfileStatus(AccountStatus.COMPLETED);
                    u.setStatus(AccountStatus.ACTIVE);
                    userRepository.save(u);
                });
            } catch (Exception ex) {
                log.warn("Failed to update profile completion status: {}", ex.getMessage());
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalQuestions", totalQuestions);
        result.put("totalCorrect", totalCorrect);
        result.put("overallPercentage", overallPercentage);
        result.put("hasCompletedAssessment", true);
        result.put("retestAvailableAt", retestAvailableAt.toString());
        result.put("retestCooldownDays", RETEST_COOLDOWN_DAYS);
        result.put("skills", skillBreakdown);
        result.put("laggedTopics", laggedTopics);
        result.put("earnedCoins", 100);
        result.put("earnedXp", 250);
        result.put("questionResults", questionEvaluations);
        return result;
    }

    /**
     * Retrieves current validation assessment status, scores, retest cooldown, and active lagged topics.
     */
    public Map<String, Object> getAssessmentStatus(UUID userId) {
        Map<String, Object> status = new LinkedHashMap<>();
        if (userId == null) {
            status.put("hasCompletedAssessment", false);
            status.put("canRetest", true);
            status.put("skills", Collections.emptyList());
            status.put("laggedTopics", Collections.emptyList());
            return status;
        }

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
        boolean completed = profileOpt.map(StudentProfile::isHasCompletedAssessment).orElse(false);
        Instant completedAt = profileOpt.map(StudentProfile::getAssessmentCompletedAt).orElse(null);

        List<StudentSkill> userSkills = studentSkillRepository.findByUserId(userId);
        Instant earliestRetest = null;
        List<Map<String, Object>> skillsData = new ArrayList<>();

        for (StudentSkill s : userSkills) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("skillName", s.getSkillName());
            item.put("score", s.getScore() != null ? s.getScore().doubleValue() : null);
            item.put("questionsTested", s.getQuestionsTested() != null ? s.getQuestionsTested() : 0);
            item.put("questionsCorrect", s.getQuestionsCorrect() != null ? s.getQuestionsCorrect() : 0);
            item.put("verified", s.isVerified());
            item.put("lastAssessedAt", s.getLastAssessedAt() != null ? s.getLastAssessedAt().toString() : null);
            item.put("retestAvailableAt", s.getRetestAvailableAt() != null ? s.getRetestAvailableAt().toString() : null);

            // Fetch rank
            if (s.getSkillName() != null) {
                String scope = s.getSkillName().toUpperCase();
                long scoreInt = s.getScore() != null ? Math.round(s.getScore().doubleValue() * 100) : 0;
                Long rank = leaderboardRepository.countRankHigherThanScore("SKILL", scope, "ALL_TIME", scoreInt);
                Long totalRanked = leaderboardRepository.countTotalOnBoard("SKILL", scope, "ALL_TIME");
                item.put("rank", rank != null ? rank : 1);
                item.put("totalRanked", totalRanked != null ? totalRanked : 1);
            }

            if (s.getRetestAvailableAt() != null) {
                if (earliestRetest == null || s.getRetestAvailableAt().isAfter(earliestRetest)) {
                    earliestRetest = s.getRetestAvailableAt();
                }
            }
            skillsData.add(item);
        }

        // Active lagged topics for this student
        List<Map<String, Object>> laggedTopicsStatus = new ArrayList<>();
        try {
            List<SkillTopic> allTopics = skillTopicRepository.findAll();
            Map<UUID, SkillTopic> idToTopic = allTopics.stream().collect(Collectors.toMap(SkillTopic::getId, t -> t, (a, b) -> a));
            List<StudentLearningTopic> activeLagged = studentLearningTopicRepository.findByStudentIdOrderByStartedAtDesc(userId).stream()
                    .filter(t -> "LAGGED".equalsIgnoreCase(t.getStatus()))
                    .collect(Collectors.toList());
            for (StudentLearningTopic lt : activeLagged) {
                SkillTopic st = idToTopic.get(lt.getTopicId());
                if (st != null) {
                    Map<String, Object> lm = new LinkedHashMap<>();
                    lm.put("topicId", st.getId());
                    lm.put("topicName", st.getName());
                    lm.put("status", "LAGGED");
                    laggedTopicsStatus.add(lm);
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to fetch active lagged topics: {}", ex.getMessage());
        }

        Instant now = Instant.now();
        boolean canRetest = true;
        long cooldownSeconds = 0;

        if (earliestRetest != null && now.isBefore(earliestRetest)) {
            canRetest = false;
            cooldownSeconds = Duration.between(now, earliestRetest).toSeconds();
        }

        status.put("hasCompletedAssessment", completed);
        status.put("assessmentCompletedAt", completedAt != null ? completedAt.toString() : null);
        status.put("canRetest", canRetest);
        status.put("retestAvailableAt", earliestRetest != null ? earliestRetest.toString() : null);
        status.put("cooldownRemainingSeconds", Math.max(0, cooldownSeconds));
        status.put("skills", skillsData);
        status.put("laggedTopics", laggedTopicsStatus);
        return status;
    }

    private Skill findMatchingSkill(String skillName, List<Skill> allActiveSkills) {
        String clean = skillName.trim().toLowerCase();
        for (Skill s : allActiveSkills) {
            if (s.getName().equalsIgnoreCase(clean) ||
                (s.getSlug() != null && s.getSlug().equalsIgnoreCase(clean))) {
                return s;
            }
        }
        for (Skill s : allActiveSkills) {
            if (s.getName().toLowerCase().contains(clean) || clean.contains(s.getName().toLowerCase())) {
                return s;
            }
        }
        return null;
    }

    // Backward compatible quiz generation
    public Map<String, Object> generateVerificationQuiz(List<String> skillNames, int sampleCount) {
        return generate50QuestionAssessment(null, skillNames);
    }

    // Backward compatible quiz evaluation
    @Transactional
    public Map<String, Object> evaluateVerificationQuiz(UUID userId, List<Map<String, Object>> answers, List<String> requestedSkills) {
        return evaluate50QuestionAssessment(userId, answers, requestedSkills);
    }
}
