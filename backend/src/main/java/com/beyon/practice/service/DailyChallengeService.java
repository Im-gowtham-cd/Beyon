package com.beyon.practice.service;

import com.beyon.common.exception.ConflictException;
import com.beyon.practice.model.DailyChallenge;
import com.beyon.practice.model.Question;
import com.beyon.practice.repository.DailyChallengeRepository;
import com.beyon.practice.repository.QuestionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Service
public class DailyChallengeService {

    private final DailyChallengeRepository challengeRepository;
    private final QuestionRepository questionRepository;
    private final CoinService coinService;
    private final StreakService streakService;
    private final SkillXpService skillXpService;
    private final AchievementBadgeService badgeService;
    private final PracticeService practiceService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public DailyChallengeService(DailyChallengeRepository challengeRepository,
                                  QuestionRepository questionRepository,
                                  CoinService coinService,
                                  StreakService streakService,
                                  SkillXpService skillXpService,
                                  AchievementBadgeService badgeService,
                                  PracticeService practiceService,
                                  org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.challengeRepository = challengeRepository;
        this.questionRepository = questionRepository;
        this.coinService = coinService;
        this.streakService = streakService;
        this.skillXpService = skillXpService;
        this.badgeService = badgeService;
        this.practiceService = practiceService;
        this.jdbcTemplate = jdbcTemplate;
    }

    public DailyChallenge getTodayChallenge(UUID studentId) {
        LocalDate today = LocalDate.now();
        Optional<DailyChallenge> existing = challengeRepository.findByStudentIdAndChallengeDate(studentId, today);
        if (existing.isPresent()) {
            return existing.get();
        }
        return generateChallenge(studentId, today);
    }

    @Transactional
    public DailyChallenge generateChallenge(UUID studentId, LocalDate date) {
        // 1. Collect all skills the student is currently learning or enrolled in
        List<String> studentSkills = new ArrayList<>();
        try {
            List<String> enrolled = jdbcTemplate.queryForList(
                    "SELECT DISTINCT LOWER(skill_name) FROM student_skills WHERE user_id = ?",
                    String.class, studentId.toString()
            );
            studentSkills.addAll(enrolled);

            List<String> learning = jdbcTemplate.queryForList(
                    "SELECT DISTINCT LOWER(s.name) FROM student_learning_topics slt " +
                    "JOIN skill_topics st ON st.id = slt.topic_id " +
                    "JOIN skills s ON s.id = st.skill_id WHERE slt.student_id = ?",
                    String.class, studentId.toString()
            );
            studentSkills.addAll(learning);
        } catch (Exception ignored) {}

        // 2. Query matching unsolved questions for the student's enrolled/learning skills
        UUID selectedQuestionId = null;
        if (!studentSkills.isEmpty()) {
            try {
                String inSql = String.join("','", studentSkills);
                List<Map<String, Object>> matchingQuestions = jdbcTemplate.queryForList(
                        "SELECT q.id FROM questions q " +
                        "LEFT JOIN skills s ON s.id = q.skill_id " +
                        "WHERE (LOWER(s.name) IN ('" + inSql + "') OR " +
                        "LOWER(q.title) REGEXP '" + String.join("|", studentSkills) + "') " +
                        "AND q.id NOT IN (SELECT question_id FROM daily_challenges WHERE student_id = ? AND status = 'COMPLETED') " +
                        "ORDER BY RAND() LIMIT 5",
                        studentId.toString()
                );
                if (!matchingQuestions.isEmpty()) {
                    selectedQuestionId = UUID.fromString(matchingQuestions.get(0).get("id").toString());
                }
            } catch (Exception ignored) {}
        }

        // 3. Fallback to any published question if no specific skill question was found
        if (selectedQuestionId == null) {
            List<Question> unsolved = questionRepository.findUnsolvedForStudent(studentId, PageRequest.of(0, 20));
            if (unsolved.isEmpty()) {
                unsolved = questionRepository.findByStatusInOrderByCreatedAtDesc(List.of("PUBLISHED", "ACTIVE"), PageRequest.of(0, 20));
            }
            if (unsolved.isEmpty()) return null;
            selectedQuestionId = unsolved.get((int) (Math.random() * unsolved.size())).getId();
        }

        DailyChallenge challenge = new DailyChallenge();
        challenge.setStudentId(studentId);
        challenge.setChallengeDate(date);
        challenge.setQuestionId(selectedQuestionId);
        challenge.setStatus("PENDING");
        return challengeRepository.save(challenge);
    }

    @Transactional
    public DailyChallenge startChallenge(UUID studentId, UUID challengeId) {
        DailyChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ConflictException("Challenge not found"));
        if (!challenge.getStudentId().equals(studentId)) {
            throw new ConflictException("Not your challenge");
        }
        challenge.setStatus("IN_PROGRESS");
        challenge.setStartedAt(Instant.now());
        return challengeRepository.save(challenge);
    }

    @Transactional
    public DailyChallenge completeChallenge(UUID studentId, UUID challengeId, boolean correct, Integer timeSpent) {
        DailyChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ConflictException("Challenge not found"));
        if (!challenge.getStudentId().equals(studentId)) {
            throw new ConflictException("Not your challenge");
        }
        challenge.setStatus("COMPLETED");
        challenge.setCompletedAt(Instant.now());
        challenge.setCorrect(correct);
        challenge.setTimeSpentSeconds(timeSpent);

        DailyChallenge saved = challengeRepository.save(challenge);
        if (correct) {
            // 1. Award coins
            coinService.earnCoins(studentId, "DAILY_CHALLENGE_COMPLETED", "DAILY_CHALLENGE", challengeId);

            // 2. Advance streak
            streakService.recordActivity(studentId);

            // 3. Award achievement badge
            badgeService.awardBadge(studentId, "LEARNING_STARTER");

            // 4. Update practice stats and XP if question exists
            if (challenge.getQuestionId() != null) {
                questionRepository.findById(challenge.getQuestionId()).ifPresent(q -> {
                    practiceService.updateStats(studentId, q, true, timeSpent);
                    int xp = switch (q.getDifficulty() != null ? q.getDifficulty() : "MEDIUM") {
                        case "HARD" -> 50;
                        case "EASY" -> 15;
                        default -> 30;
                    };
                    if (q.getSkillId() != null) {
                        skillXpService.earnXp(studentId, q.getSkillId(), xp, "DAILY_CHALLENGE", challengeId, "Completed daily challenge: " + q.getTitle());
                    }
                });
            }
        }
        return saved;
    }

    public List<DailyChallenge> getHistory(UUID studentId) {
        return challengeRepository.findByStudentIdOrderByChallengeDateDesc(studentId);
    }
}
