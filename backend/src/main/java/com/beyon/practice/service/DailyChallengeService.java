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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DailyChallengeService {

    private final DailyChallengeRepository challengeRepository;
    private final QuestionRepository questionRepository;
    private final CoinService coinService;
    private final StreakService streakService;
    private final SkillXpService skillXpService;
    private final AchievementBadgeService badgeService;
    private final PracticeService practiceService;

    public DailyChallengeService(DailyChallengeRepository challengeRepository,
                                  QuestionRepository questionRepository,
                                  CoinService coinService,
                                  StreakService streakService,
                                  SkillXpService skillXpService,
                                  AchievementBadgeService badgeService,
                                  PracticeService practiceService) {
        this.challengeRepository = challengeRepository;
        this.questionRepository = questionRepository;
        this.coinService = coinService;
        this.streakService = streakService;
        this.skillXpService = skillXpService;
        this.badgeService = badgeService;
        this.practiceService = practiceService;
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
        List<Question> unsolved = questionRepository.findUnsolvedForStudent(studentId, PageRequest.of(0, 20));
        if (unsolved.isEmpty()) {
            unsolved = questionRepository.findByStatusInOrderByCreatedAtDesc(List.of("PUBLISHED", "ACTIVE"), PageRequest.of(0, 20));
        }
        if (unsolved.isEmpty()) return null;

        Question random = unsolved.get((int) (Math.random() * unsolved.size()));

        DailyChallenge challenge = new DailyChallenge();
        challenge.setStudentId(studentId);
        challenge.setChallengeDate(date);
        challenge.setQuestionId(random.getId());
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
