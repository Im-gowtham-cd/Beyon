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
}
