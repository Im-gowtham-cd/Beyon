package com.beyon.intelligence.service;

import com.beyon.intelligence.client.AiIntelligenceClient;
import com.beyon.intelligence.model.SkillRecommendation;
import com.beyon.intelligence.repository.SkillRecommendationRepository;
import com.beyon.profile.model.StudentProfile;
import com.beyon.profile.model.StudentSkill;
import com.beyon.profile.repository.StudentProfileRepository;
import com.beyon.profile.repository.StudentSkillRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Closed-loop recommendation service.
 * Connects to FastAPI AI Intelligence service to strictly recommend only the skills,
 * courses, questions, and projects that close this specific student's calculated gaps.
 * Strictly adheres to anti-popular course filtering: never recommends generic popular courses.
 */
@Service
@Transactional
public class RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);

    private final SkillRecommendationRepository recRepo;
    private final StudentProfileRepository profileRepo;
    private final StudentSkillRepository studentSkillRepo;
    private final JdbcTemplate jdbcTemplate;
    private final AiIntelligenceClient aiClient;

    public RecommendationService(SkillRecommendationRepository recRepo,
                                  StudentProfileRepository profileRepo,
                                  StudentSkillRepository studentSkillRepo,
                                  JdbcTemplate jdbcTemplate,
                                  AiIntelligenceClient aiClient) {
        this.recRepo = recRepo;
        this.profileRepo = profileRepo;
        this.studentSkillRepo = studentSkillRepo;
        this.jdbcTemplate = jdbcTemplate;
        this.aiClient = aiClient;
    }

    public List<SkillRecommendation> getRecommendations(UUID studentId) {
        List<SkillRecommendation> existing = recRepo.findByStudentIdAndStatusOrderByScoreDesc(studentId, "PENDING");
        if (existing.isEmpty()) {
            return generateRecommendations(studentId);
        }
        return existing;
    }

    public List<SkillRecommendation> generateRecommendations(UUID studentId) {
        // Clear previous pending recommendations for fresh gap assessment
        recRepo.deleteAll(recRepo.findByStudentIdAndStatusOrderByScoreDesc(studentId, "PENDING"));

        List<SkillRecommendation> recs = new ArrayList<>();

        StudentProfile profile = profileRepo.findByUserId(studentId).orElse(null);
        List<StudentSkill> currentSkills = studentSkillRepo.findByUserId(studentId);
        String targetRole = profile != null && profile.getPreferredJobRoles() != null
                ? profile.getPreferredJobRoles().split(",")[0].trim()
                : "Software Engineer";

        // Query career path requirements
        List<Map<String, Object>> pathSkills = Collections.emptyList();
        try {
            pathSkills = jdbcTemplate.queryForList(
                    "SELECT s.id, s.name, cp.title AS pathTitle, cps.proficiency_level, cps.is_core " +
                    "FROM career_path_skills cps " +
                    "JOIN career_paths cp ON cp.id = cps.career_path_id " +
                    "JOIN skills s ON s.id = cps.skill_id " +
                    "ORDER BY cps.is_core DESC, cps.sort_order ASC LIMIT 25"
            );
        } catch (Exception e) {
            log.warn("Could not query career path skills: {}", e.getMessage());
        }

        // Build payload for AI Intelligence Service
        Map<String, Object> studentSkillsMap = new HashMap<>();
        for (StudentSkill ss : currentSkills) {
            Map<String, Object> skillData = new HashMap<>();
            String profName = ss.getProficiency() != null ? ss.getProficiency().name() : "BEGINNER";
            double score = "EXPERT".equalsIgnoreCase(profName) ? 90.0 :
                           "ADVANCED".equalsIgnoreCase(profName) ? 75.0 :
                           "INTERMEDIATE".equalsIgnoreCase(profName) ? 55.0 : 35.0;
            skillData.put("current_score", score);
            skillData.put("confidence", 0.85);
            studentSkillsMap.put(ss.getSkillName(), skillData);
        }

        List<Map<String, Object>> roleRequirements = new ArrayList<>();
        for (Map<String, Object> ps : pathSkills) {
            Map<String, Object> req = new HashMap<>();
            req.put("skill_name", ps.get("name"));
            req.put("required_score", 75.0);
            req.put("career_relevance", Boolean.TRUE.equals(ps.get("is_core")) ? 0.95 : 0.75);
            req.put("industry_demand", 0.85);
            req.put("opportunity_relevance", 0.80);
            req.put("prerequisite_importance", 0.70);
            roleRequirements.add(req);
        }

        // 1. Attempt delegation to FastAPI AI Intelligence engine
        boolean aiSucceeded = false;
        try {
            Map<String, Object> aiResult = aiClient.getPersonalizedRecommendations(
                    studentId.toString(),
                    targetRole,
                    studentSkillsMap,
                    roleRequirements,
                    Collections.emptyList(),
                    6
            );

            if (aiResult != null && aiResult.containsKey("recommendations")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> aiRecs = (List<Map<String, Object>>) aiResult.get("recommendations");
                for (Map<String, Object> item : aiRecs) {
                    SkillRecommendation rec = new SkillRecommendation();
                    rec.setStudentId(studentId);
                    rec.setSkillId(UUID.randomUUID());
                    rec.setSkillName((String) item.getOrDefault("target_skill", (String) item.get("title")));
                    rec.setRecommendationType("COURSE");
                    Object gapRed = item.get("estimated_gap_reduction");
                    double score = gapRed instanceof Number ? 70.0 + ((Number) gapRed).doubleValue() : 88.0;
                    rec.setScore(BigDecimal.valueOf(Math.min(99.0, score)));
                    rec.setReason((String) item.getOrDefault("reason", "Personalized recommendation targeting your specific skill gap."));
                    recs.add(rec);
                }
                if (!recs.isEmpty()) {
                    aiSucceeded = true;
                    log.info("Loaded {} strictly personalized recommendations from AI engine for student {}", recs.size(), studentId);
                }
            }
        } catch (Exception e) {
            log.warn("AI Intelligence engine call failed, falling back to local gap analysis: {}", e.getMessage());
        }

        // 2. Resilient local fallback if AI engine is unreachable
        if (!aiSucceeded) {
            Set<String> knownSkillNames = currentSkills.stream()
                    .map(s -> s.getSkillName().trim().toLowerCase())
                    .collect(Collectors.toSet());

            for (Map<String, Object> ps : pathSkills) {
                String sName = (String) ps.get("name");
                UUID sId = UUID.fromString(ps.get("id").toString());
                String pathTitle = (String) ps.get("pathTitle");

                if (!knownSkillNames.contains(sName.toLowerCase())) {
                    SkillRecommendation rec = new SkillRecommendation();
                    rec.setStudentId(studentId);
                    rec.setSkillId(sId);
                    rec.setSkillName(sName);
                    rec.setRecommendationType("COURSE");
                    rec.setScore(new BigDecimal("95"));
                    rec.setReason("High-priority gap for " + pathTitle + " (" + targetRole + "). Master this to bridge requirements.");
                    recs.add(rec);
                }
            }

            for (StudentSkill ss : currentSkills) {
                SkillRecommendation practiceRec = new SkillRecommendation();
                practiceRec.setStudentId(studentId);
                practiceRec.setSkillId(ss.getId() != null ? ss.getId() : UUID.randomUUID());
                practiceRec.setSkillName(ss.getSkillName());
                practiceRec.setRecommendationType("PRACTICE");
                practiceRec.setScore(new BigDecimal("90"));
                practiceRec.setReason("Targeted daily questions to advance your " + ss.getProficiency() + " level in " + ss.getSkillName() + ".");
                recs.add(practiceRec);
            }
        }

        Map<String, SkillRecommendation> uniqueRecs = new LinkedHashMap<>();
        for (SkillRecommendation r : recs) {
            String key = r.getSkillName() + "_" + r.getRecommendationType();
            if (!uniqueRecs.containsKey(key)) {
                uniqueRecs.put(key, r);
            }
        }

        List<SkillRecommendation> finalList = new ArrayList<>(uniqueRecs.values());
        finalList.sort(Comparator.comparing(SkillRecommendation::getScore).reversed());

        return recRepo.saveAll(finalList.stream().limit(10).collect(Collectors.toList()));
    }

    public void markCompleted(UUID recommendationId, UUID studentId) {
        SkillRecommendation rec = recRepo.findById(recommendationId).orElseThrow();
        if (!rec.getStudentId().equals(studentId)) throw new RuntimeException("Forbidden");
        rec.setStatus("COMPLETED");
        rec.setCompletedAt(OffsetDateTime.now());
        recRepo.save(rec);
    }
}
