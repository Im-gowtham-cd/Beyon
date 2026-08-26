package com.beyon.platform.service;

import com.beyon.platform.model.PlatformDailyStats;
import com.beyon.platform.repository.PlatformDailyStatsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;

@Service
@Transactional
public class AdminDashboardService {

    private final PlatformDailyStatsRepository statsRepo;

    public AdminDashboardService(PlatformDailyStatsRepository statsRepo) {
        this.statsRepo = statsRepo;
    }

    public Map<String, Object> getDashboard() {
        List<PlatformDailyStats> recent = statsRepo.findTop30ByOrderByStatDateDesc();
        PlatformDailyStats today = recent.isEmpty() ? new PlatformDailyStats() : recent.get(0);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("today", today);
        result.put("recentDays", recent);
        result.put("trends", calculateTrends(recent));
        return result;
    }

    public Map<String, Object> getOverview() {
        List<PlatformDailyStats> recent = statsRepo.findTop30ByOrderByStatDateDesc();
        if (recent.isEmpty()) return Map.of("totalUsers", 0, "activeUsers", 0);

        PlatformDailyStats latest = recent.get(0);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalUsers", latest.getTotalUsers());
        result.put("activeUsers", latest.getActiveUsers());
        result.put("totalAssessments", latest.getTotalAssessments());
        result.put("totalApplications", latest.getTotalApplications());
        result.put("totalPlacements", latest.getTotalPlacements());
        result.put("activeCompanies", latest.getActiveCompanies());
        result.put("activeInstitutions", latest.getActiveInstitutions());
        result.put("newRegistrations", latest.getNewRegistrations());
        result.put("totalCoinsEarned", latest.getTotalCoinsEarned());
        result.put("totalCoinsSpent", latest.getTotalCoinsSpent());
        return result;
    }

    public PlatformDailyStats recordDailyStats(PlatformDailyStats stats) {
        PlatformDailyStats existing = statsRepo.findByStatDate(stats.getStatDate()).orElse(null);
        if (existing != null) {
            existing.setTotalUsers(stats.getTotalUsers());
            existing.setActiveUsers(stats.getActiveUsers());
            existing.setTotalAssessments(stats.getTotalAssessments());
            existing.setTotalApplications(stats.getTotalApplications());
            existing.setTotalPlacements(stats.getTotalPlacements());
            existing.setActiveCompanies(stats.getActiveCompanies());
            existing.setActiveInstitutions(stats.getActiveInstitutions());
            existing.setNewRegistrations(stats.getNewRegistrations());
            existing.setNewPosts(stats.getNewPosts());
            return statsRepo.save(existing);
        }
        return statsRepo.save(stats);
    }

    private Map<String, Object> calculateTrends(List<PlatformDailyStats> recent) {
        if (recent.size() < 2) return Map.of();
        PlatformDailyStats current = recent.get(0);
        PlatformDailyStats previous = recent.get(1);
        Map<String, Object> trends = new LinkedHashMap<>();
        trends.put("userGrowth", current.getTotalUsers() - previous.getTotalUsers());
        trends.put("activeUserChange", current.getActiveUsers() - previous.getActiveUsers());
        trends.put("assessmentChange", current.getTotalAssessments() - previous.getTotalAssessments());
        return trends;
    }
}
