package com.beyon.recruitment.service;

import com.beyon.recruitment.model.*;
import com.beyon.recruitment.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class InstitutionRatingService {

    private final InstitutionRatingRepository ratingRepo;
    private final PlacementRecordRepository recordRepo;
    private final InstitutionPlacementStatsRepository statsRepo;

    public InstitutionRatingService(InstitutionRatingRepository ratingRepo,
                                     PlacementRecordRepository recordRepo,
                                     InstitutionPlacementStatsRepository statsRepo) {
        this.ratingRepo = ratingRepo;
        this.recordRepo = recordRepo;
        this.statsRepo = statsRepo;
    }

    public Map<String, Object> calculateAndSave(UUID institutionId, Integer year) {
        InstitutionRating rating = ratingRepo.findByInstitutionId(institutionId)
            .orElseGet(() -> {
                InstitutionRating r = new InstitutionRating();
                r.setInstitutionId(institutionId);
                return r;
            });

        // Placement stats
        Optional<InstitutionPlacementStats> stats = statsRepo.findByInstitutionIdAndAcademicYear(institutionId, year);
        InstitutionPlacementStats s = stats.orElse(new InstitutionPlacementStats());

        // Placement score (0-10)
        BigDecimal placementScore = BigDecimal.ZERO;
        if (s.getEligible() > 0) {
            double rate = s.getPlaced() * 100.0 / s.getEligible();
            placementScore = BigDecimal.valueOf(Math.min(10, rate / 10)).setScale(2, RoundingMode.HALF_UP);
        }
        rating.setPlacementScore(placementScore);

        // Salary score (0-10)
        BigDecimal avgPkg = s.getAveragePackage() != null ? s.getAveragePackage() : BigDecimal.ZERO;
        BigDecimal salaryScore = avgPkg.compareTo(BigDecimal.ZERO) > 0
            ? BigDecimal.valueOf(Math.min(10, avgPkg.doubleValue() / 2)).setScale(2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        rating.setSalaryScore(salaryScore);

        // Industry score (companies visited)
        int companies = s.getCompaniesVisited() != null ? s.getCompaniesVisited() : 0;
        BigDecimal industryScore = BigDecimal.valueOf(Math.min(10, companies / 5.0)).setScale(2, RoundingMode.HALF_UP);
        rating.setIndustryScore(industryScore);

        // Skill score (placeholder — would need skill graph data)
        BigDecimal skillScore = BigDecimal.valueOf(7.0).setScale(2, RoundingMode.HALF_UP);
        rating.setSkillScore(skillScore);

        // Academic score (placeholder — would need academic data)
        BigDecimal academicScore = BigDecimal.valueOf(7.5).setScale(2, RoundingMode.HALF_UP);
        rating.setAcademicScore(academicScore);

        // Overall: weighted average
        BigDecimal overall = placementScore.multiply(new BigDecimal("0.35"))
            .add(salaryScore.multiply(new BigDecimal("0.25")))
            .add(industryScore.multiply(new BigDecimal("0.20")))
            .add(skillScore.multiply(new BigDecimal("0.10")))
            .add(academicScore.multiply(new BigDecimal("0.10")))
            .setScale(2, RoundingMode.HALF_UP);
        rating.setOverallRating(overall);
        rating.setCalculationVersion(rating.getCalculationVersion() + 1);
        rating.setLastCalculatedAt(OffsetDateTime.now());
        rating.setUpdatedAt(OffsetDateTime.now());
        ratingRepo.save(rating);

        return buildResponse(rating);
    }

    public Map<String, Object> getRating(UUID institutionId) {
        InstitutionRating rating = ratingRepo.findByInstitutionId(institutionId).orElse(null);
        if (rating == null) return Map.of("institutionId", institutionId, "overallRating", BigDecimal.ZERO);
        return buildResponse(rating);
    }

    private Map<String, Object> buildResponse(InstitutionRating rating) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("institutionId", rating.getInstitutionId());
        result.put("academicScore", rating.getAcademicScore());
        result.put("placementScore", rating.getPlacementScore());
        result.put("salaryScore", rating.getSalaryScore());
        result.put("industryScore", rating.getIndustryScore());
        result.put("skillScore", rating.getSkillScore());
        result.put("overallRating", rating.getOverallRating());
        result.put("calculationVersion", rating.getCalculationVersion());
        result.put("lastCalculatedAt", rating.getLastCalculatedAt());
        return result;
    }
}
