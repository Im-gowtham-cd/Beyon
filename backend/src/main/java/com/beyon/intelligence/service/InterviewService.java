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
    private final com.beyon.practice.repository.CompanyOpportunityRepository opportunityRepo;
    private final com.beyon.identity.repository.UserRepository userRepo;

    public InterviewService(InterviewRoundRepository roundRepo, InterviewScheduleRepository scheduleRepo,
                            InterviewScorecardRepository scorecardRepo, com.beyon.recruitment.repository.RecruitmentApplicationRepository applicationRepo,
                            com.beyon.practice.repository.CompanyOpportunityRepository opportunityRepo,
                            com.beyon.identity.repository.UserRepository userRepo) {
        this.roundRepo = roundRepo;
        this.scheduleRepo = scheduleRepo;
        this.scorecardRepo = scorecardRepo;
        this.applicationRepo = applicationRepo;
        this.opportunityRepo = opportunityRepo;
        this.userRepo = userRepo;
    }

    public List<Map<String, Object>> getCompanyInterviews(UUID companyUserId) {
        List<com.beyon.practice.model.CompanyOpportunity> opps = opportunityRepo.findByCompanyUserIdOrderByCreatedAtDesc(companyUserId);
        if (opps.isEmpty()) {
            return Collections.emptyList();
        }
        Set<UUID> oppIds = new HashSet<>();
        for (com.beyon.practice.model.CompanyOpportunity opp : opps) {
            oppIds.add(opp.getId());
        }
        Map<UUID, com.beyon.recruitment.model.RecruitmentApplication> appMap = new HashMap<>();
        for (com.beyon.recruitment.model.RecruitmentApplication a : applicationRepo.findAll()) {
            if (a.getOpportunityId() != null && oppIds.contains(a.getOpportunityId())) {
                appMap.put(a.getId(), a);
            }
        }
        if (appMap.isEmpty()) {
            return Collections.emptyList();
        }

        List<InterviewSchedule> schedules = new ArrayList<>();
        for (InterviewSchedule s : scheduleRepo.findAll()) {
            if (appMap.containsKey(s.getApplicationId())) {
                schedules.add(s);
            }
        }

        List<Map<String, Object>> results = new ArrayList<>();
        for (InterviewSchedule s : schedules) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", s.getId());
            map.put("applicationId", s.getApplicationId());
            map.put("status", s.getStatus());
            map.put("scheduledAt", s.getScheduledAt() != null ? s.getScheduledAt().toString() : "");
            map.put("durationMinutes", s.getDurationMinutes());
            map.put("meetingLink", s.getMeetingLink());
            map.put("location", s.getLocation());
            map.put("notes", s.getNotes());

            com.beyon.recruitment.model.RecruitmentApplication app = appMap.get(s.getApplicationId());
            if (app != null) {
                userRepo.findById(app.getStudentId()).ifPresent(u -> map.put("candidateName", u.getDisplayName()));
                opportunityRepo.findById(app.getOpportunityId()).ifPresent(opp -> map.put("role", opp.getTitle()));
            }

            roundRepo.findById(s.getRoundId()).ifPresent(r -> {
                map.put("roundName", r.getName());
                map.put("roundType", r.getRoundType());
            });

            List<InterviewScorecard> cards = scorecardRepo.findByScheduleId(s.getId());
            if (!cards.isEmpty()) {
                map.put("score", cards.get(0).getOverallScore());
                map.put("recommendation", cards.get(0).getRecommendation());
                map.put("feedback", cards.get(0).getNotes());
            }

            results.add(map);
        }
        return results;
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

