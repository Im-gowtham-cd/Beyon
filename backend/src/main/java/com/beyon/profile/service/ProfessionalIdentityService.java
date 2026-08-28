package com.beyon.profile.service;

import com.beyon.profile.model.*;
import com.beyon.profile.repository.*;
import com.beyon.intelligence.model.StudentSkillGraph;
import com.beyon.intelligence.repository.StudentSkillGraphRepository;
import com.beyon.intelligence.model.StudentPortfolioItem;
import com.beyon.intelligence.repository.StudentPortfolioItemRepository;
import com.beyon.intelligence.model.StudentSkillIntelligence;
import com.beyon.intelligence.repository.StudentSkillIntelligenceRepository;
import com.beyon.notification.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProfessionalIdentityService {

    private final ProfessionalProfileRepository profileRepo;
    private final BeyonCertificateRepository certRepo;
    private final SkillEndorsementRepository endorseRepo;
    private final PortfolioProjectRepository projectRepo;
    private final PortfolioVerificationRepository verifyRepo;
    private final GeneratedResumeRepository resumeRepo;
    private final StudentSkillGraphRepository graphRepo;
    private final StudentPortfolioItemRepository portfolioRepo;
    private final StudentSkillIntelligenceRepository intelRepo;
    private final NotificationService notificationService;

    public ProfessionalIdentityService(ProfessionalProfileRepository profileRepo,
                                        BeyonCertificateRepository certRepo,
                                        SkillEndorsementRepository endorseRepo,
                                        PortfolioProjectRepository projectRepo,
                                        PortfolioVerificationRepository verifyRepo,
                                        GeneratedResumeRepository resumeRepo,
                                        StudentSkillGraphRepository graphRepo,
                                        StudentPortfolioItemRepository portfolioRepo,
                                        StudentSkillIntelligenceRepository intelRepo,
                                        NotificationService notificationService) {
        this.profileRepo = profileRepo;
        this.certRepo = certRepo;
        this.endorseRepo = endorseRepo;
        this.projectRepo = projectRepo;
        this.verifyRepo = verifyRepo;
        this.resumeRepo = resumeRepo;
        this.graphRepo = graphRepo;
        this.portfolioRepo = portfolioRepo;
        this.intelRepo = intelRepo;
        this.notificationService = notificationService;
    }

    // Phase 181: Certificate Generation
    public BeyonCertificate generateCertificate(UUID studentId, String type, String title, String skillName, String issuerName, Integer score) {
        BeyonCertificate cert = new BeyonCertificate();
        cert.setStudentId(studentId);
        cert.setCertificateType(type);
        cert.setTitle(title);
        cert.setSkillName(skillName);
        cert.setIssuerName(issuerName);
        cert.setScore(score);
        cert.setCertificateNumber(generateCertNumber(type));
        cert.setVerificationUrl("/verify/" + cert.getCertificateNumber());
        cert.setQrData("BEYON-CERT:" + cert.getCertificateNumber());
        return certRepo.save(cert);
    }

    // Phase 182: Credential Verification
    public Map<String, Object> verifyCredential(String certificateNumber) {
        BeyonCertificate cert = certRepo.findByCertificateNumber(certificateNumber)
            .orElseThrow(() -> new RuntimeException("Certificate not found"));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("verified", "VERIFIED".equals(cert.getVerificationStatus()));
        result.put("certificateNumber", cert.getCertificateNumber());
        result.put("title", cert.getTitle());
        result.put("studentName", "Beyon Student");
        result.put("skillName", cert.getSkillName());
        result.put("issuerName", cert.getIssuerName());
        result.put("score", cert.getScore());
        result.put("issuedAt", cert.getIssuedAt());
        result.put("expiresAt", cert.getExpiresAt());
        result.put("verificationStatus", cert.getVerificationStatus());
        result.put("skillsCovered", cert.getSkillsCovered());
        return result;
    }

    // Phase 184: Skill Endorsements
    public SkillEndorsement endorseSkill(UUID studentId, UUID skillId, UUID endorserId, String endorserName, String endorserType, String level) {
        // Prevent duplicate endorsement from same person
        List<SkillEndorsement> existing = endorseRepo.findByStudentIdAndSkillIdAndStatus(studentId, skillId, "ACTIVE");
        boolean alreadyEndorsed = existing.stream().anyMatch(e -> e.getEndorserId().equals(endorserId));
        if (alreadyEndorsed) throw new RuntimeException("Already endorsed this skill");

        SkillEndorsement endorsement = new SkillEndorsement();
        endorsement.setStudentId(studentId);
        endorsement.setSkillId(skillId);
        endorsement.setEndorserId(endorserId);
        endorsement.setEndorserName(endorserName);
        endorsement.setEndorserType(endorserType);
        endorsement.setEndorsementLevel(level != null ? level : "ENDORSED");
        return endorseRepo.save(endorsement);
    }

    public List<SkillEndorsement> getMyEndorsements(UUID studentId) {
        return endorseRepo.findByStudentIdAndStatusOrderByCreatedAtDesc(studentId, "ACTIVE");
    }

    public Map<String, Object> getSkillEndorsementSummary(UUID studentId, UUID skillId) {
        List<SkillEndorsement> endorsements = endorseRepo.findByStudentIdAndSkillIdAndStatus(studentId, skillId, "ACTIVE");
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalEndorsements", endorsements.size());
        result.put("endorsed", endorsements.stream().filter(e -> "ENDORSED".equals(e.getEndorsementLevel())).count());
        result.put("stronglyEndorsed", endorsements.stream().filter(e -> "STRONGLY_ENDORSED".equals(e.getEndorsementLevel())).count());
        result.put("verified", endorsements.stream().filter(e -> "VERIFIED".equals(e.getEndorsementLevel())).count());
        result.put("endorsers", endorsements.stream().map(e -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name", e.getEndorserName());
            m.put("type", e.getEndorserType());
            m.put("level", e.getEndorsementLevel());
            return m;
        }).collect(Collectors.toList()));
        return result;
    }

    // Phase 185: Professional Profile
    public ProfessionalProfile createOrUpdateProfile(UUID userId, ProfessionalProfile updates) {
        ProfessionalProfile profile = profileRepo.findByUserId(userId)
            .orElseGet(() -> {
                ProfessionalProfile p = new ProfessionalProfile();
                p.setUserId(userId);
                return p;
            });
        if (updates.getHeadline() != null) profile.setHeadline(updates.getHeadline());
        if (updates.getAbout() != null) profile.setAbout(updates.getAbout());
        if (updates.getLocation() != null) profile.setLocation(updates.getLocation());
        if (updates.getWebsiteUrl() != null) profile.setWebsiteUrl(updates.getWebsiteUrl());
        if (updates.getGithubUrl() != null) profile.setGithubUrl(updates.getGithubUrl());
        if (updates.getLinkedinUrl() != null) profile.setLinkedinUrl(updates.getLinkedinUrl());
        if (updates.getPortfolioUrl() != null) profile.setPortfolioUrl(updates.getPortfolioUrl());
        if (updates.getVisibility() != null) profile.setVisibility(updates.getVisibility());
        profile.setUpdatedAt(OffsetDateTime.now());
        return profileRepo.save(profile);
    }

    public Map<String, Object> getProfessionalProfile(UUID userId) {
        ProfessionalProfile profile = profileRepo.findByUserId(userId).orElse(null);
        List<BeyonCertificate> certs = certRepo.findByStudentIdOrderByIssuedAtDesc(userId);
        List<SkillEndorsement> endorsements = endorseRepo.findByStudentIdAndStatusOrderByCreatedAtDesc(userId, "ACTIVE");
        List<PortfolioProject> projects = projectRepo.findByStudentIdOrderBySortOrder(userId);
        List<StudentSkillGraph> skills = graphRepo.findByStudentIdOrderByProficiencyPctDesc(userId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("profile", profile);
        result.put("certificates", certs.stream().limit(10).collect(Collectors.toList()));
        result.put("endorsementCount", endorsements.size());
        result.put("projectCount", projects.size());
        result.put("skillCount", skills.size());
        result.put("featuredProjects", projects.stream().filter(PortfolioProject::getIsFeatured).limit(5).collect(Collectors.toList()));
        return result;
    }

    // Phase 186: Portfolio Builder
    public PortfolioProject addProject(UUID studentId, PortfolioProject project) {
        project.setStudentId(studentId);
        project.setSortOrder(projectRepo.findByStudentIdOrderBySortOrder(studentId).size());
        return projectRepo.save(project);
    }

    public List<PortfolioProject> getMyProjects(UUID studentId) {
        return projectRepo.findByStudentIdOrderBySortOrder(studentId);
    }

    public PortfolioProject updateProject(UUID projectId, UUID studentId, PortfolioProject updates) {
        PortfolioProject project = projectRepo.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!project.getStudentId().equals(studentId)) throw new RuntimeException("Forbidden");
        if (updates.getTitle() != null) project.setTitle(updates.getTitle());
        if (updates.getDescription() != null) project.setDescription(updates.getDescription());
        if (updates.getRole() != null) project.setRole(updates.getRole());
        if (updates.getSkillsUsed() != null) project.setSkillsUsed(updates.getSkillsUsed());
        if (updates.getGithubUrl() != null) project.setGithubUrl(updates.getGithubUrl());
        if (updates.getLiveDemoUrl() != null) project.setLiveDemoUrl(updates.getLiveDemoUrl());
        if (updates.getIsFeatured() != null) project.setIsFeatured(updates.getIsFeatured());
        project.setUpdatedAt(OffsetDateTime.now());
        return projectRepo.save(project);
    }

    public PortfolioProject toggleFeatured(UUID projectId, UUID studentId) {
        PortfolioProject project = projectRepo.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!project.getStudentId().equals(studentId)) throw new RuntimeException("Forbidden");
        project.setIsFeatured(!project.getIsFeatured());
        project.setUpdatedAt(OffsetDateTime.now());
        return projectRepo.save(project);
    }

    // Phase 187: Portfolio Verification
    public PortfolioVerification requestVerification(UUID projectId, UUID verifierId, String verifierType) {
        PortfolioVerification verify = new PortfolioVerification();
        verify.setProjectId(projectId);
        verify.setVerifierId(verifierId);
        verify.setVerifierType(verifierType);
        return verifyRepo.save(verify);
    }

    public PortfolioVerification respondToVerification(UUID verificationId, String status, UUID respondedBy) {
        PortfolioVerification verify = verifyRepo.findById(verificationId)
            .orElseThrow(() -> new RuntimeException("Verification not found"));
        verify.setVerificationStatus(status);
        if ("VERIFIED".equals(status)) {
            verify.setVerifiedAt(OffsetDateTime.now());
            PortfolioProject project = projectRepo.findById(verify.getProjectId()).orElse(null);
            if (project != null) {
                project.setVerificationStatus("VERIFIED");
                project.setVerifiedBy(respondedBy);
                project.setVerifiedAt(OffsetDateTime.now());
                project.setVerificationSource(verify.getVerifierType());
                projectRepo.save(project);
            }
        }
        verify.setUpdatedAt(OffsetDateTime.now());
        return verifyRepo.save(verify);
    }

    // Phase 189: Resume Generator
    public GeneratedResume generateResume(UUID studentId, UUID templateId) {
        // Build sections from verified data
        List<BeyonCertificate> certs = certRepo.findByStudentIdOrderByIssuedAtDesc(studentId);
        List<SkillEndorsement> endorsements = endorseRepo.findByStudentIdAndStatusOrderByCreatedAtDesc(studentId, "ACTIVE");
        List<PortfolioProject> projects = projectRepo.findByStudentIdOrderBySortOrder(studentId);
        List<StudentSkillGraph> skills = graphRepo.findByStudentIdOrderByProficiencyPctDesc(studentId);

        List<Map<String, Object>> sections = new ArrayList<>();
        sections.add(Map.of("type", "skills", "items", skills.stream().limit(10).map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name", "Skill");
            m.put("level", s.getLevel());
            m.put("proficiency", s.getProficiencyPct());
            m.put("verified", s.getVerified());
            return m;
        }).collect(Collectors.toList())));
        sections.add(Map.of("type", "certifications", "items", certs.stream().limit(5).map(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("title", c.getTitle());
            m.put("issuer", c.getIssuerName());
            m.put("date", c.getIssuedAt());
            m.put("score", c.getScore());
            return m;
        }).collect(Collectors.toList())));
        sections.add(Map.of("type", "projects", "items", projects.stream().limit(5).map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("title", p.getTitle());
            m.put("description", p.getDescription());
            m.put("skills", p.getSkillsUsed());
            m.put("github", p.getGithubUrl());
            m.put("verified", "VERIFIED".equals(p.getVerificationStatus()));
            return m;
        }).collect(Collectors.toList())));

        GeneratedResume resume = new GeneratedResume();
        resume.setStudentId(studentId);
        resume.setTemplateId(templateId);
        resume.setTitle("My Resume");
        resume.setSections(new com.fasterxml.jackson.databind.ObjectMapper().valueToTree(sections).toString());
        resume.setGenerationStatus("GENERATED");
        resume.setAiSuggestions("{\"summary\": \"Professional profile built from verified Beyon data.\", \"skillOrder\": \"sorted by proficiency\"}");
        return resumeRepo.save(resume);
    }

    public List<GeneratedResume> getMyResumes(UUID studentId) {
        return resumeRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    private String generateCertNumber(String type) {
        String prefix = switch (type) {
            case "SKILL" -> "SKL";
            case "COURSE" -> "CRS";
            case "ASSESSMENT" -> "ASS";
            case "CHALLENGE" -> "CHL";
            case "INTERNSHIP" -> "INT";
            case "PROJECT" -> "PRJ";
            case "INDUSTRY" -> "IND";
            default -> "GEN";
        };
        return "BYN-" + prefix + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
