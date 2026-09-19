package com.beyon.practice.repository;

import com.beyon.practice.model.Leaderboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface LeaderboardRepository extends JpaRepository<Leaderboard, UUID> {
    @Query("SELECT l FROM Leaderboard l WHERE l.boardType = :boardType AND l.period = :period ORDER BY l.score DESC")
    List<Leaderboard> findByBoardTypeAndPeriod(String boardType, String period);

    @Query("SELECT l FROM Leaderboard l WHERE l.boardType = :boardType AND l.period = :period ORDER BY l.score DESC LIMIT :limit")
    List<Leaderboard> findTopByBoardTypeAndPeriod(String boardType, String period, int limit);

    Leaderboard findByStudentIdAndBoardTypeAndBoardScopeAndPeriod(UUID studentId, String boardType, String boardScope, String period);

    @Query("SELECT COUNT(l) + 1 FROM Leaderboard l WHERE l.boardType = :boardType AND UPPER(l.boardScope) = UPPER(:boardScope) AND l.period = :period AND l.score > :score")
    Long countRankHigherThanScore(String boardType, String boardScope, String period, long score);

    @Query("SELECT COUNT(l) FROM Leaderboard l WHERE l.boardType = :boardType AND UPPER(l.boardScope) = UPPER(:boardScope) AND l.period = :period")
    Long countTotalOnBoard(String boardType, String boardScope, String period);

    @Query("SELECT l FROM Leaderboard l WHERE l.boardType = :boardType AND UPPER(l.boardScope) = UPPER(:boardScope) AND l.period = :period ORDER BY l.score DESC")
    List<Leaderboard> findByBoardTypeAndBoardScopeAndPeriodOrderByScoreDesc(String boardType, String boardScope, String period);
}

