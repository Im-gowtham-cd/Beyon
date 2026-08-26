package com.beyon.intelligence.service;

import com.beyon.intelligence.model.*;
import com.beyon.intelligence.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class InterviewService {

    private final InterviewRoundRepository roundRepo;
    private final InterviewScheduleRepository scheduleRepo;
    private final InterviewScorecardRepository scorecardRepo;
    private final com.beyon.recruitment.repository.RecruitmentApplicationRepository applicationRepo;

    public InterviewService(InterviewRoundRepository roundRepo, InterviewScheduleRepository scheduleRepo,
                            InterviewScorecardRepository scorecardRepo, com.beyon.recruitment.repository.RecruitmentApplicationRepository applicationRepo) {
        this.roundRepo = roundRepo;
        this.scheduleRepo = scheduleRepo;
        this.scorecardRepo = scorecardRepo;
        this.applicationRepo = applicationRepo;
    }

    public InterviewRound createRound(InterviewRound round) { return roundRepo.save(round); }

    public List<InterviewRound> getRounds(UUID opportunityId) { return roundRepo.findByOpportunityIdOrderBySortOrder(opportunityId); }

    public InterviewSchedule scheduleInterview(InterviewSchedule schedule) { return scheduleRepo.save(schedule); }

    public List<InterviewSchedule> getApplicationInterviews(UUID applicationId) { return scheduleRepo.findByApplicationId(applicationId); }

    public InterviewScorecard submitScorecard(InterviewScorecard scorecard) {
        scorecard.setSubmittedAt(OffsetDateTime.now());
        return scorecardRepo.save(scorecard);
    }

    public Map<String, Object> getInterviewSummary(UUID applicationId) {
        List<InterviewSchedule> schedules = scheduleRepo.findByApplicationId(applicationId);
        List<Map<String, Object>> rounds = new ArrayList<>();
        BigDecimal totalScore = BigDecimal.ZERO;
        int scoreCount = 0;

        for (InterviewSchedule s : schedules) {
            List<InterviewScorecard> cards = scorecardRepo.findByScheduleId(s.getId());
            Map<String, Object> round = new LinkedHashMap<>();
            round.put("scheduleId", s.getId());
            round.put("status", s.getStatus());
            round.put("scheduledAt", s.getScheduledAt());
            if (!cards.isEmpty()) {
                InterviewScorecard card = cards.get(0);
                round.put("overallScore", card.getOverallScore());
                round.put("recommendation", card.getRecommendation());
                round.put("strengths", card.getStrengths());
                if (card.getOverallScore() != null) {
                    totalScore = totalScore.add(card.getOverallScore());
                    scoreCount++;
                }
            }
            rounds.add(round);
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("applicationId", applicationId);
        summary.put("totalRounds", schedules.size());
        summary.put("completedRounds", schedules.stream().filter(s -> "COMPLETED".equals(s.getStatus())).count());
        summary.put("overallScore", scoreCount > 0 ? totalScore.divide(BigDecimal.valueOf(scoreCount), 2, RoundingMode.HALF_UP) : null);
        summary.put("rounds", rounds);
        return summary;
    }
}
