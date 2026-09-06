package com.beyon.intelligence.service;

import com.beyon.intelligence.model.SkillRecommendation;
import com.beyon.intelligence.repository.SkillRecommendationRepository;
import com.beyon.profile.model.StudentProfile;
import com.beyon.profile.model.StudentSkill;
import com.beyon.profile.repository.StudentProfileRepository;
import com.beyon.profile.repository.StudentSkillRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class RecommendationService {

    private final SkillRecommendationRepository recRepo;
    private final StudentProfileRepository profileRepo;
    private final StudentSkillRepository studentSkillRepo;
    private final JdbcTemplate jdbcTemplate;

    public RecommendationService(SkillRecommendationRepository recRepo,
                                  StudentProfileRepository profileRepo,
                                  StudentSkillRepository studentSkillRepo,
                                  JdbcTemplate jdbcTemplate) {
        this.recRepo = recRepo;
        this.profileRepo = profileRepo;
        this.studentSkillRepo = studentSkillRepo;
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<SkillRecommendation> getRecommendations(UUID studentId) {
        List<SkillRecommendation> existing = recRepo.findByStudentIdAndStatusOrderByScoreDesc(studentId, "PENDING");
        if (existing.isEmpty()) {
            return generateRecommendations(studentId);
        }
        return existing;
    }

    public List<SkillRecommendation> generateRecommendations(UUID studentId) {
        recRepo.deleteAll(recRepo.findByStudentIdAndStatusOrderByScoreDesc(studentId, "PENDING"));

        List<SkillRecommendation> recs = new ArrayList<>();

        StudentProfile profile = profileRepo.findByUserId(studentId).orElse(null);
        List<StudentSkill> currentSkills = studentSkillRepo.findByUserId(studentId);
        Set<String> knownSkillNames = currentSkills.stream()
                .map(s -> s.getSkillName().trim().toLowerCase())
                .collect(Collectors.toSet());

        try {
            List<String> learningSkills = jdbcTemplate.queryForList(
                    "SELECT DISTINCT s.name FROM student_learning_topics slt " +
                    "JOIN skill_topics st ON st.id = slt.topic_id " +
                    "JOIN skills s ON s.id = st.skill_id WHERE slt.student_id = ?",
                    String.class, studentId.toString()
            );
            learningSkills.forEach(s -> knownSkillNames.add(s.trim().toLowerCase()));
        } catch (Exception ignored) {}

        String targetRoles = profile != null && profile.getPreferredJobRoles() != null ? profile.getPreferredJobRoles() : "Full Stack Developer";
        List<Map<String, Object>> pathSkills = jdbcTemplate.queryForList(
                "SELECT s.id, s.name, cp.title AS pathTitle, cps.proficiency_level, cps.is_core " +
                "FROM career_path_skills cps " +
                "JOIN career_paths cp ON cp.id = cps.career_path_id " +
                "JOIN skills s ON s.id = cps.skill_id " +
                "ORDER BY cps.is_core DESC, cps.sort_order ASC LIMIT 25"
        );

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
                rec.setReason("High-demand core skill for " + pathTitle + " (" + targetRoles + "). Master this to bridge industry skill gaps.");
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
            practiceRec.setReason("Solve daily questions to advance your current " + ss.getProficiency() + " proficiency in " + ss.getSkillName() + ".");
            recs.add(practiceRec);

            SkillRecommendation assessRec = new SkillRecommendation();
            assessRec.setStudentId(studentId);
            assessRec.setSkillId(ss.getId() != null ? ss.getId() : UUID.randomUUID());
            assessRec.setSkillName(ss.getSkillName());
            assessRec.setRecommendationType("ASSESSMENT");
            assessRec.setScore(new BigDecimal("88"));
            assessRec.setReason("Take verified AI skill benchmark to qualify for enterprise placement drives in " + ss.getSkillName() + ".");
            recs.add(assessRec);
        }

        try {
            List<Map<String, Object>> programs = jdbcTemplate.queryForList(
                    "SELECT id, title, domain FROM learning_programs ORDER BY created_at DESC LIMIT 3"
            );
            for (Map<String, Object> p : programs) {
                SkillRecommendation courseRec = new SkillRecommendation();
                courseRec.setStudentId(studentId);
                courseRec.setSkillId(UUID.fromString(p.get("id").toString()));
                courseRec.setSkillName((String) p.get("title"));
                courseRec.setRecommendationType("PROJECT");
                courseRec.setScore(new BigDecimal("85"));
                courseRec.setReason("Structured curriculum track in " + p.get("domain") + " aligned with campus placement standards.");
                recs.add(courseRec);
            }
        } catch (Exception ignored) {}

        if (recs.isEmpty()) {
            List<String> defaults = List.of("Java & Spring Boot", "Python & Data Structures", "React & TypeScript", "SQL & Database Systems", "Docker & Cloud Deployments");
            for (int i = 0; i < defaults.size(); i++) {
                SkillRecommendation dRec = new SkillRecommendation();
                dRec.setStudentId(studentId);
                dRec.setSkillId(UUID.randomUUID());
                dRec.setSkillName(defaults.get(i));
                dRec.setRecommendationType("PRACTICE");
                dRec.setScore(BigDecimal.valueOf(90 - i * 5));
                dRec.setReason("Essential industry benchmark skill recommended for campus placement readiness.");
                recs.add(dRec);
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

        return recRepo.saveAll(finalList.stream().limit(12).collect(Collectors.toList()));
    }

    public void markCompleted(UUID recommendationId, UUID studentId) {
        SkillRecommendation rec = recRepo.findById(recommendationId).orElseThrow();
        if (!rec.getStudentId().equals(studentId)) throw new RuntimeException("Forbidden");
        rec.setStatus("COMPLETED");
        rec.setCompletedAt(OffsetDateTime.now());
        recRepo.save(rec);
    }
}

