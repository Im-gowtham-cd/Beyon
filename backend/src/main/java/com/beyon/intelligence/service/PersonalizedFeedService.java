package com.beyon.intelligence.service;

import com.beyon.intelligence.model.PersonalizedFeedItem;
import com.beyon.intelligence.repository.PersonalizedFeedItemRepository;
import com.beyon.practice.model.DailyChallenge;
import com.beyon.practice.repository.DailyChallengeRepository;
import com.beyon.practice.service.DailyChallengeService;
import com.beyon.intelligence.model.CareerPath;
import com.beyon.intelligence.repository.CareerPathRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class PersonalizedFeedService {

    private final PersonalizedFeedItemRepository feedRepo;
    private final DailyChallengeService challengeService;
    private final DailyChallengeRepository challengeRepo;
    private final CareerPathRepository careerPathRepo;

    public PersonalizedFeedService(PersonalizedFeedItemRepository feedRepo, DailyChallengeService challengeService,
                                    DailyChallengeRepository challengeRepo, CareerPathRepository careerPathRepo) {
        this.feedRepo = feedRepo;
        this.challengeService = challengeService;
        this.challengeRepo = challengeRepo;
        this.careerPathRepo = careerPathRepo;
    }

    @Transactional
    public void generateFeed(UUID studentId) {
        feedRepo.findByStudentIdAndDismissedFalseOrderByRelevanceScoreDescCreatedAtDesc(studentId)
                .forEach(item -> {
                    if (item.getCreatedAt() != null && item.getCreatedAt().toLocalDate().isBefore(LocalDate.now().minusDays(3))) {
                        item.setDismissed(true);
                        feedRepo.save(item);
                    }
                });

        DailyChallenge todayChallenge = challengeService.getTodayChallenge(studentId);
        if (todayChallenge != null && !challengeExistsInFeed(studentId, "DAILY_CHALLENGE", todayChallenge.getId().toString())) {
            addFeedItem(studentId, "DAILY_CHALLENGE", "Today's Challenge", "Complete today's personalized challenge to earn coins and XP",
                    "/challenges/" + todayChallenge.getId(), "Start Challenge", new BigDecimal("0.95"));
        }

        if (!challengeExistsInFeed(studentId, "CAREER_TIP", "weekly_test")) {
            addFeedItem(studentId, "WEEKEND_TEST", "Weekly Challenge Available", "Test your skills with this week's assessment",
                    "/weekly-test", "Take Test", new BigDecimal("0.80"));
        }

        addFeedItem(studentId, "CONTINUE_LEARNING", "Continue Your Journey", "Keep building your skills",
                "/dashboard", "View Dashboard", new BigDecimal("0.70"));
    }

    private boolean challengeExistsInFeed(UUID studentId, String type, String sourceId) {
        List<PersonalizedFeedItem> items = feedRepo.findByStudentIdAndDismissedFalseOrderByRelevanceScoreDescCreatedAtDesc(studentId);
        return items.stream().anyMatch(i -> type.equals(i.getItemType()) && i.getDescription() != null && i.getDescription().contains(sourceId));
    }

    private void addFeedItem(UUID studentId, String type, String title, String description, String actionUrl, String actionLabel, BigDecimal relevance) {
        PersonalizedFeedItem item = new PersonalizedFeedItem();
        item.setStudentId(studentId);
        item.setItemType(type);
        item.setTitle(title);
        item.setDescription(description);
        item.setActionUrl(actionUrl);
        item.setActionLabel(actionLabel);
        item.setRelevanceScore(relevance);
        item.setDismissed(false);
        feedRepo.save(item);
    }

    public List<PersonalizedFeedItem> getFeed(UUID studentId) {
        return feedRepo.findByStudentIdAndDismissedFalseOrderByRelevanceScoreDescCreatedAtDesc(studentId);
    }

    @Transactional
    public void dismissItem(UUID studentId, UUID itemId) {
        feedRepo.findById(itemId).ifPresent(item -> {
            if (item.getStudentId().equals(studentId)) {
                item.setDismissed(true);
                feedRepo.save(item);
            }
        });
    }
}
