package com.beyon.practice.service;

import com.beyon.practice.model.Leaderboard;
import com.beyon.practice.repository.LeaderboardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class LeaderboardService {

    private final LeaderboardRepository leaderboardRepository;
    private final CoinService coinService;

    public LeaderboardService(LeaderboardRepository leaderboardRepository, CoinService coinService) {
        this.leaderboardRepository = leaderboardRepository;
        this.coinService = coinService;
    }

    @Transactional
    public void updateScore(UUID studentId, long additionalScore) {
        Leaderboard entry = leaderboardRepository.findByStudentIdAndBoardTypeAndBoardScopeAndPeriod(
                studentId, "GLOBAL", "GLOBAL", "ALL_TIME");
        if (entry == null) {
            entry = new Leaderboard();
            entry.setStudentId(studentId);
            entry.setBoardType("GLOBAL");
            entry.setBoardScope("GLOBAL");
            entry.setPeriod("ALL_TIME");
            entry.setScore(additionalScore);
        } else {
            entry.setScore(entry.getScore() + additionalScore);
        }
        leaderboardRepository.save(entry);
    }

    public List<Leaderboard> getGlobalLeaderboard(int limit) {
        return leaderboardRepository.findTopByBoardTypeAndPeriod("GLOBAL", "ALL_TIME", limit);
    }

    public Leaderboard getStudentRank(UUID studentId) {
        return leaderboardRepository.findByStudentIdAndBoardTypeAndBoardScopeAndPeriod(
                studentId, "GLOBAL", "GLOBAL", "ALL_TIME");
    }
}
