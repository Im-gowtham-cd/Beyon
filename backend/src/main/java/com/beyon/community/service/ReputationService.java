package com.beyon.community.service;

import com.beyon.community.model.ReputationEvent;
import com.beyon.community.model.UserReputation;
import com.beyon.community.repository.ReputationEventRepository;
import com.beyon.community.repository.UserReputationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class ReputationService {
    private final UserReputationRepository repRepo;
    private final ReputationEventRepository eventRepo;

    public ReputationService(UserReputationRepository repRepo, ReputationEventRepository eventRepo) {
        this.repRepo = repRepo;
        this.eventRepo = eventRepo;
    }

    public UserReputation getOrCreateReputation(UUID userId) {
        return repRepo.findByUserId(userId).orElseGet(() -> {
            UserReputation r = new UserReputation();
            r.setUserId(userId);
            return repRepo.save(r);
        });
    }

    public void addReputation(UUID userId, String eventType, int points, String refType, UUID refId) {
        UserReputation rep = getOrCreateReputation(userId);
        rep.setTotalReputation(rep.getTotalReputation() + points);

        switch (eventType) {
            case "HELPFUL_ANSWER", "ANSWER" -> rep.setAnswersCount(rep.getAnswersCount() + 1);
            case "ACCEPTED_ANSWER" -> rep.setAcceptedAnswers(rep.getAcceptedAnswers() + 1);
            case "UPVOTE" -> rep.setUpvotesReceived(rep.getUpvotesReceived() + 1);
        }
        repRepo.save(rep);

        ReputationEvent event = new ReputationEvent();
        event.setUserId(userId);
        event.setEventType(eventType);
        event.setPoints(points);
        event.setReferenceType(refType);
        event.setReferenceId(refId);
        eventRepo.save(event);
    }

    public Map<String, Object> getReputationSummary(UUID userId) {
        UserReputation rep = getOrCreateReputation(userId);
        List<ReputationEvent> recent = eventRepo.findByUserIdOrderByCreatedAtDesc(userId);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalReputation", rep.getTotalReputation());
        result.put("answersCount", rep.getAnswersCount());
        result.put("acceptedAnswers", rep.getAcceptedAnswers());
        result.put("upvotesReceived", rep.getUpvotesReceived());
        result.put("recentEvents", recent.stream().limit(10).toList());
        return result;
    }

    private static final Map<String, Integer> REPUTATION_POINTS = Map.of(
        "HELPFUL_ANSWER", 5,
        "ACCEPTED_ANSWER", 15,
        "UPVOTE", 2,
        "WEEKLY_CONTRIBUTION", 25,
        "MENTORSHIP", 50,
        "WORKSHOP_HOSTED", 30
    );

    public int getPointsForEvent(String eventType) {
        return REPUTATION_POINTS.getOrDefault(eventType, 0);
    }
}
