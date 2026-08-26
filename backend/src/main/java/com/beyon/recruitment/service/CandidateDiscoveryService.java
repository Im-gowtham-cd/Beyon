package com.beyon.recruitment.service;

import com.beyon.recruitment.model.*;
import com.beyon.recruitment.repository.*;
import com.beyon.intelligence.model.StudentSkillGraph;
import com.beyon.intelligence.repository.StudentSkillGraphRepository;
import com.beyon.profile.model.Skill;
import com.beyon.profile.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CandidateDiscoveryService {

    private final CandidateShortlistRepository shortlistRepo;
    private final RecruitmentDriveRepository driveRepo;
    private final RecruitmentApplicationRepository applicationRepo;
    private final PlacementRegistrationRepository placementRepo;
    private final StudentSkillGraphRepository graphRepo;
    private final SkillRepository skillRepo;

    public CandidateDiscoveryService(CandidateShortlistRepository shortlistRepo,
                                      RecruitmentDriveRepository driveRepo,
                                      RecruitmentApplicationRepository applicationRepo,
                                      PlacementRegistrationRepository placementRepo,
                                      StudentSkillGraphRepository graphRepo,
                                      SkillRepository skillRepo) {
        this.shortlistRepo = shortlistRepo;
        this.driveRepo = driveRepo;
        this.applicationRepo = applicationRepo;
        this.placementRepo = placementRepo;
        this.graphRepo = graphRepo;
        this.skillRepo = skillRepo;
    }

    // Phase 168: Auto-shortlist candidates based on configurable rules
    public List<Map<String, Object>> autoShortlist(UUID driveId, UUID companyId) {
        RecruitmentDrive drive = driveRepo.findById(driveId)
            .orElseThrow(() -> new RuntimeException("Drive not found"));
        if (!drive.getCompanyUserId().equals(companyId)) throw new RuntimeException("Forbidden");

        List<RecruitmentApplication> applications = applicationRepo.findByDriveId(driveId);
        List<Map<String, Object>> ranked = new ArrayList<>();

        for (RecruitmentApplication app : applications) {
            if ("REJECTED".equals(app.getStatus()) || "WITHDRAWN".equals(app.getStatus())) continue;

            // Calculate skill match
            BigDecimal skillMatch = calculateSkillMatch(app.getStudentId(), drive.getRequiredSkills());
            BigDecimal assessmentScore = app.getAssessmentScore() != null ? app.getAssessmentScore() : BigDecimal.ZERO;

            // Overall score: 50% assessment + 50% skill match
            BigDecimal overall = assessmentScore.multiply(new BigDecimal("0.5"))
                .add(skillMatch.multiply(new BigDecimal("0.5")))
                .setScale(2, RoundingMode.HALF_UP);

            Map<String, Object> candidate = new LinkedHashMap<>();
            candidate.put("applicationId", app.getId());
            candidate.put("studentId", app.getStudentId());
            candidate.put("assessmentScore", assessmentScore);
            candidate.put("skillMatch", skillMatch);
            candidate.put("overallScore", overall);
            candidate.put("status", app.getStatus());
            ranked.add(candidate);
        }

        // Sort by overall score descending
        ranked.sort((a, b) -> ((BigDecimal) b.get("overallScore")).compareTo((BigDecimal) a.get("overallScore")));

        // Assign ranks
        for (int i = 0; i < ranked.size(); i++) {
            ranked.get(i).put("rank", i + 1);
        }

        return ranked;
    }

    // Phase 168: Shortlist a candidate
    public CandidateShortlist shortlistCandidate(UUID driveId, UUID studentId, UUID pipelineId, UUID shortlistedBy) {
        Optional<CandidateShortlist> existing = shortlistRepo.findByDriveIdAndStudentId(driveId, studentId);
        if (existing.isPresent()) return existing.get();

        RecruitmentDrive drive = driveRepo.findById(driveId)
            .orElseThrow(() -> new RuntimeException("Drive not found"));

        BigDecimal skillMatch = calculateSkillMatch(studentId, drive.getRequiredSkills());
        long rank = shortlistRepo.countByDriveId(driveId) + 1;

        CandidateShortlist shortlist = new CandidateShortlist();
        shortlist.setDriveId(driveId);
        shortlist.setStudentId(studentId);
        shortlist.setPipelineId(pipelineId);
        shortlist.setSkillMatchScore(skillMatch);
        shortlist.setRankInDrive((int) rank);
        shortlist.setShortlistedBy(shortlistedBy);
        return shortlistRepo.save(shortlist);
    }

    public List<CandidateShortlist> getDriveShortlist(UUID driveId) {
        return shortlistRepo.findByDriveIdOrderByRankInDrive(driveId);
    }

    public CandidateShortlist updateShortlistStatus(UUID shortlistId, String newStatus, String notes) {
        CandidateShortlist shortlist = shortlistRepo.findById(shortlistId)
            .orElseThrow(() -> new RuntimeException("Shortlist not found"));
        shortlist.setStatus(newStatus);
        if (notes != null) shortlist.setNotes(notes);
        shortlist.setUpdatedAt(java.time.OffsetDateTime.now());
        return shortlistRepo.save(shortlist);
    }

    // Phase 164: Check student eligibility for a drive
    public Map<String, Object> checkEligibility(UUID studentId, UUID driveId) {
        RecruitmentDrive drive = driveRepo.findById(driveId)
            .orElseThrow(() -> new RuntimeException("Drive not found"));

        boolean alreadyApplied = applicationRepo.findByDriveId(driveId).stream()
            .anyMatch(a -> a.getStudentId().equals(studentId));
        BigDecimal skillMatch = calculateSkillMatch(studentId, drive.getRequiredSkills());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("eligible", !alreadyApplied);
        result.put("alreadyApplied", alreadyApplied);
        result.put("coinCost", drive.getCoinCost());
        result.put("requiredSkills", drive.getRequiredSkills());
        result.put("skillMatch", skillMatch);
        result.put("driveTitle", drive.getTitle());
        result.put("jobRole", drive.getJobRole());
        return result;
    }

    private BigDecimal calculateSkillMatch(UUID studentId, String requiredSkills) {
        if (requiredSkills == null || requiredSkills.isEmpty()) return BigDecimal.valueOf(70);

        List<StudentSkillGraph> studentSkills = graphRepo.findByStudentIdOrderByProficiencyPctDesc(studentId);
        String[] required = requiredSkills.split(",");
        if (required.length == 0) return BigDecimal.valueOf(70);

        int matched = 0;
        for (String req : required) {
            String skillName = req.trim().toLowerCase();
            boolean found = studentSkills.stream().anyMatch(s -> {
                Skill skill = skillRepo.findById(s.getSkillId()).orElse(null);
                return skill != null && skill.getName().toLowerCase().contains(skillName);
            });
            if (found) matched++;
        }

        return BigDecimal.valueOf(matched * 100 / required.length);
    }
}
