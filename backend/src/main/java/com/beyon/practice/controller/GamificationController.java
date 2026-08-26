package com.beyon.practice.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.practice.model.Leaderboard;
import com.beyon.practice.model.StudentAchievementBadge;
import com.beyon.practice.model.StudentStreak;
import com.beyon.practice.service.LeaderboardService;
import com.beyon.practice.service.StreakService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/gamification")
public class GamificationController {

    private final StreakService streakService;
    private final LeaderboardService leaderboardService;

    public GamificationController(StreakService streakService, LeaderboardService leaderboardService) {
        this.streakService = streakService;
        this.leaderboardService = leaderboardService;
    }

    @GetMapping("/streak")
    public ResponseEntity<ApiResponse<StudentStreak>> getStreak(Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(streakService.getStreak(studentId)));
    }

    @GetMapping("/badges")
    public ResponseEntity<ApiResponse<List<StudentAchievementBadge>>> getBadges(Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(streakService.getBadges(studentId)));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<Leaderboard>>> getLeaderboard(
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(leaderboardService.getGlobalLeaderboard(limit)));
    }

    @GetMapping("/leaderboard/me")
    public ResponseEntity<ApiResponse<Leaderboard>> getMyRank(Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(leaderboardService.getStudentRank(studentId)));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
