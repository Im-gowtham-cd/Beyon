package com.beyon.profile.service;

import com.beyon.common.exception.ConflictException;
import com.beyon.common.exception.ForbiddenException;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.profile.dto.*;
import com.beyon.profile.enums.SkillProficiency;
import com.beyon.profile.enums.WorkType;
import com.beyon.profile.model.*;
import com.beyon.profile.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StudentProfileService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final StudentProjectRepository studentProjectRepository;
    private final StudentCertificationRepository studentCertificationRepository;
    private final StudentAchievementRepository studentAchievementRepository;
    private final StudentLinkRepository studentLinkRepository;
    private final StudentLearningSkillRepository studentLearningSkillRepository;
    private final StudentCareerPreferencesRepository studentCareerPreferencesRepository;
    private final SkillRepository skillRepository;

    public StudentProfileService(UserRepository userRepository,
                                  StudentProfileRepository studentProfileRepository,
                                  StudentSkillRepository studentSkillRepository,
                                  StudentProjectRepository studentProjectRepository,
                                  StudentCertificationRepository studentCertificationRepository,
                                  StudentAchievementRepository studentAchievementRepository,
                                  StudentLinkRepository studentLinkRepository,
                                  StudentLearningSkillRepository studentLearningSkillRepository,
                                  StudentCareerPreferencesRepository studentCareerPreferencesRepository,
                                  SkillRepository skillRepository) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.studentProjectRepository = studentProjectRepository;
        this.studentCertificationRepository = studentCertificationRepository;
        this.studentAchievementRepository = studentAchievementRepository;
        this.studentLinkRepository = studentLinkRepository;
        this.studentLearningSkillRepository = studentLearningSkillRepository;
        this.studentCareerPreferencesRepository = studentCareerPreferencesRepository;
        this.skillRepository = skillRepository;
    }

    public StudentProfile getProfile(UUID userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
    }

    @Transactional
    public StudentProfile updateProfile(UUID userId, UpdateStudentProfileRequest req) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (req.getUsername() != null && !req.getUsername().isBlank()) {
            String cleanUsername = req.getUsername().toLowerCase().replaceAll("[^a-z0-9._-]", "");
            if (cleanUsername.length() < 3 || cleanUsername.length() > 50) {
                throw new ConflictException("Username must be between 3 and 50 characters");
            }
            var existing = studentProfileRepository.findByUsername(cleanUsername);
            if (existing.isPresent() && !existing.get().getUserId().equals(userId)) {
                throw new ConflictException("Username is already taken");
            }
            profile.setUsername(cleanUsername);
        }

        if (req.getPhone() != null) profile.setPhone(req.getPhone());
        if (req.getGender() != null) profile.setGender(req.getGender());
        if (req.getCountry() != null) profile.setCountry(req.getCountry());
        if (req.getState() != null) profile.setState(req.getState());
        if (req.getCity() != null) profile.setCity(req.getCity());
        if (req.getInstitution() != null) profile.setInstitution(req.getInstitution());
        if (req.getDegree() != null) profile.setDegree(req.getDegree());
        if (req.getDepartment() != null) profile.setDepartment(req.getDepartment());
        if (req.getAcademicYear() != null) profile.setAcademicYear(req.getAcademicYear());
        if (req.getGraduationYear() != null) profile.setGraduationYear(req.getGraduationYear());
        if (req.getCgpa() != null) profile.setCgpa(req.getCgpa());
        if (req.getAboutMe() != null) profile.setAboutMe(req.getAboutMe());
        if (req.getProfilePhotoUrl() != null) profile.setProfilePhotoUrl(req.getProfilePhotoUrl());

        profile.setCompletionPct(calculateCompletion(userId));
        return studentProfileRepository.save(profile);
    }

    public List<StudentSkill> getSkills(UUID userId) {
        return studentSkillRepository.findByUserId(userId);
    }

    @Transactional
    public StudentSkill addSkill(UUID userId, StudentSkillRequest req) {
        if (studentSkillRepository.existsByUserIdAndSkillNameIgnoreCase(userId, req.getSkillName())) {
            throw new ConflictException("Skill already added");
        }

        StudentSkill skill = new StudentSkill();
        skill.setUserId(userId);
        skill.setSkillName(req.getSkillName());
        skill.setCategory(req.getCategory());
        skill.setProficiency(req.getProficiency() != null ? SkillProficiency.valueOf(req.getProficiency()) : SkillProficiency.BEGINNER);
        skill.setSource("SELF_REPORTED");
        return studentSkillRepository.save(skill);
    }

    @Transactional
    public void removeSkill(UUID userId, UUID skillId) {
        StudentSkill skill = studentSkillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
        if (!skill.getUserId().equals(userId)) {
            throw new ForbiddenException("Cannot modify another student's skill");
        }
        studentSkillRepository.delete(skill);
    }

    public List<StudentProject> getProjects(UUID userId) {
        return studentProjectRepository.findByUserId(userId);
    }

    @Transactional
    public StudentProject addProject(UUID userId, StudentProjectRequest req) {
        StudentProject project = new StudentProject();
        project.setUserId(userId);
        project.setName(req.getName());
        project.setDescription(req.getDescription());
        project.setRole(req.getRole());
        project.setTechnologies(req.getTechnologies());
        project.setGithubUrl(req.getGithubUrl());
        project.setLiveUrl(req.getLiveUrl());
        project.setImageUrl(req.getImageUrl());
        project.setStartDate(req.getStartDate());
        project.setEndDate(req.getEndDate());
        if (Boolean.TRUE.equals(req.getFeatured())) {
            long featuredCount = studentProjectRepository.findByUserId(userId).stream()
                    .filter(StudentProject::isFeatured).count();
            if (featuredCount >= 3) {
                throw new ConflictException("Maximum 3 featured projects allowed");
            }
            project.setFeatured(true);
        }
        return studentProjectRepository.save(project);
    }

    @Transactional
    public StudentProject updateProject(UUID userId, UUID projectId, StudentProjectRequest req) {
        StudentProject project = studentProjectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (!project.getUserId().equals(userId)) {
            throw new ForbiddenException("Cannot modify another student's project");
        }

        if (req.getName() != null) project.setName(req.getName());
        if (req.getDescription() != null) project.setDescription(req.getDescription());
        if (req.getRole() != null) project.setRole(req.getRole());
        if (req.getTechnologies() != null) project.setTechnologies(req.getTechnologies());
        if (req.getGithubUrl() != null) project.setGithubUrl(req.getGithubUrl());
        if (req.getLiveUrl() != null) project.setLiveUrl(req.getLiveUrl());
        if (req.getImageUrl() != null) project.setImageUrl(req.getImageUrl());
        if (req.getStartDate() != null) project.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) project.setEndDate(req.getEndDate());
        if (req.getFeatured() != null) {
            if (req.getFeatured() && !project.isFeatured()) {
                long featuredCount = studentProjectRepository.findByUserId(userId).stream()
                        .filter(StudentProject::isFeatured).count();
                if (featuredCount >= 3) {
                    throw new ConflictException("Maximum 3 featured projects allowed");
                }
            }
            project.setFeatured(req.getFeatured());
        }

        return studentProjectRepository.save(project);
    }

    @Transactional
    public void removeProject(UUID userId, UUID projectId) {
        StudentProject project = studentProjectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (!project.getUserId().equals(userId)) {
            throw new ForbiddenException("Cannot delete another student's project");
        }
        studentProjectRepository.delete(project);
    }

    public List<StudentCertification> getCertifications(UUID userId) {
        return studentCertificationRepository.findByUserId(userId);
    }

    @Transactional
    public StudentCertification addCertification(UUID userId, StudentCertificationRequest req) {
        StudentCertification cert = new StudentCertification();
        cert.setUserId(userId);
        cert.setName(req.getName());
        cert.setIssuingOrg(req.getIssuingOrg());
        cert.setIssueDate(req.getIssueDate());
        cert.setExpiryDate(req.getExpiryDate());
        cert.setCredentialId(req.getCredentialId());
        cert.setCredentialUrl(req.getCredentialUrl());
        cert.setCertificateUrl(req.getCertificateUrl());
        return studentCertificationRepository.save(cert);
    }

    @Transactional
    public StudentCertification updateCertification(UUID userId, UUID certId, StudentCertificationRequest req) {
        StudentCertification cert = studentCertificationRepository.findById(certId)
                .orElseThrow(() -> new ResourceNotFoundException("Certification not found"));
        if (!cert.getUserId().equals(userId)) {
            throw new ForbiddenException("Cannot modify another student's certification");
        }

        if (req.getName() != null) cert.setName(req.getName());
        if (req.getIssuingOrg() != null) cert.setIssuingOrg(req.getIssuingOrg());
        if (req.getIssueDate() != null) cert.setIssueDate(req.getIssueDate());
        if (req.getExpiryDate() != null) cert.setExpiryDate(req.getExpiryDate());
        if (req.getCredentialId() != null) cert.setCredentialId(req.getCredentialId());
        if (req.getCredentialUrl() != null) cert.setCredentialUrl(req.getCredentialUrl());
        if (req.getCertificateUrl() != null) cert.setCertificateUrl(req.getCertificateUrl());

        return studentCertificationRepository.save(cert);
    }

    @Transactional
    public void removeCertification(UUID userId, UUID certId) {
        StudentCertification cert = studentCertificationRepository.findById(certId)
                .orElseThrow(() -> new ResourceNotFoundException("Certification not found"));
        if (!cert.getUserId().equals(userId)) {
            throw new ForbiddenException("Cannot delete another student's certification");
        }
        studentCertificationRepository.delete(cert);
    }

    public List<StudentAchievement> getAchievements(UUID userId) {
        return studentAchievementRepository.findByUserIdOrderByAchievementDateDesc(userId);
    }

    @Transactional
    public StudentAchievement addAchievement(UUID userId, StudentAchievementRequest req) {
        StudentAchievement achievement = new StudentAchievement();
        achievement.setUserId(userId);
        achievement.setTitle(req.getTitle());
        achievement.setDescription(req.getDescription());
        achievement.setCategory(req.getCategory());
        achievement.setOrganization(req.getOrganization());
        achievement.setAchievementDate(req.getAchievementDate());
        achievement.setUrl(req.getUrl());
        achievement.setProofUrl(req.getProofUrl());
        return studentAchievementRepository.save(achievement);
    }

    @Transactional
    public StudentAchievement updateAchievement(UUID userId, UUID achievementId, StudentAchievementRequest req) {
        StudentAchievement achievement = studentAchievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement not found"));
        if (!achievement.getUserId().equals(userId)) {
            throw new ForbiddenException("Cannot modify another student's achievement");
        }

        if (req.getTitle() != null) achievement.setTitle(req.getTitle());
        if (req.getDescription() != null) achievement.setDescription(req.getDescription());
        if (req.getCategory() != null) achievement.setCategory(req.getCategory());
        if (req.getOrganization() != null) achievement.setOrganization(req.getOrganization());
        if (req.getAchievementDate() != null) achievement.setAchievementDate(req.getAchievementDate());
        if (req.getUrl() != null) achievement.setUrl(req.getUrl());
        if (req.getProofUrl() != null) achievement.setProofUrl(req.getProofUrl());

        return studentAchievementRepository.save(achievement);
    }

    @Transactional
    public void removeAchievement(UUID userId, UUID achievementId) {
        StudentAchievement achievement = studentAchievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement not found"));
        if (!achievement.getUserId().equals(userId)) {
            throw new ForbiddenException("Cannot delete another student's achievement");
        }
        studentAchievementRepository.delete(achievement);
    }

    public List<StudentLink> getLinks(UUID userId) {
        return studentLinkRepository.findByUserId(userId);
    }

    @Transactional
    public StudentLink addLink(UUID userId, StudentLinkRequest req) {
        boolean exists = studentLinkRepository.findByUserId(userId).stream()
                .anyMatch(l -> l.getPlatform().equalsIgnoreCase(req.getPlatform()));
        if (exists) {
            throw new ConflictException("Link for " + req.getPlatform() + " already exists");
        }
        StudentLink link = new StudentLink();
        link.setUserId(userId);
        link.setPlatform(req.getPlatform());
        link.setUrl(req.getUrl());
        return studentLinkRepository.save(link);
    }

    @Transactional
    public void removeLink(UUID userId, UUID linkId) {
        StudentLink link = studentLinkRepository.findById(linkId)
                .orElseThrow(() -> new ResourceNotFoundException("Link not found"));
        if (!link.getUserId().equals(userId)) {
            throw new ForbiddenException("Cannot delete another student's link");
        }
        studentLinkRepository.delete(link);
    }

    public List<StudentLearningSkill> getLearningSkills(UUID userId) {
        return studentLearningSkillRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public StudentLearningSkill addLearningSkill(UUID userId, StudentLearningSkillRequest req) {
        if (studentLearningSkillRepository.existsByUserIdAndSkillNameIgnoreCase(userId, req.getSkillName())) {
            throw new ConflictException("Already learning this skill");
        }
        StudentLearningSkill learning = new StudentLearningSkill();
        learning.setUserId(userId);
        learning.setSkillId(req.getSkillId());
        learning.setSkillName(req.getSkillName());
        learning.setStatus("LEARNING");
        return studentLearningSkillRepository.save(learning);
    }

    @Transactional
    public void removeLearningSkill(UUID userId, UUID learningId) {
        StudentLearningSkill learning = studentLearningSkillRepository.findById(learningId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning skill not found"));
        if (!learning.getUserId().equals(userId)) {
            throw new ForbiddenException("Cannot modify another student's learning skill");
        }
        studentLearningSkillRepository.delete(learning);
    }

    public StudentCareerPreferences getCareerPreferences(UUID userId) {
        return studentCareerPreferencesRepository.findByUserId(userId).orElse(null);
    }

    @Transactional
    public StudentCareerPreferences updateCareerPreferences(UUID userId, StudentCareerPreferencesRequest req) {
        StudentCareerPreferences prefs = studentCareerPreferencesRepository.findByUserId(userId)
                .orElse(new StudentCareerPreferences());
        prefs.setUserId(userId);
        if (req.getPreferredRoles() != null) prefs.setPreferredRoles(String.join(",", req.getPreferredRoles()));
        if (req.getPreferredIndustries() != null) prefs.setPreferredIndustries(String.join(",", req.getPreferredIndustries()));
        if (req.getPreferredWorkType() != null) prefs.setPreferredWorkType(WorkType.valueOf(req.getPreferredWorkType()));
        if (req.getPreferredLocations() != null) prefs.setPreferredLocations(String.join(",", req.getPreferredLocations()));
        if (req.getCareerGoal() != null) prefs.setCareerGoal(req.getCareerGoal());
        return studentCareerPreferencesRepository.save(prefs);
    }

    public List<Skill> searchSkills(String search, int limit) {
        return skillRepository.searchByName(search, PageRequest.of(0, Math.min(limit, 50)));
    }

    public List<Skill> getSkillsByCategory(String category) {
        return skillRepository.findByCategory(category);
    }

    public List<Skill> getAllActiveSkills() {
        return skillRepository.findAllActive();
    }

    public int calculateCompletion(UUID userId) {
        int score = 0;

        var profile = studentProfileRepository.findByUserId(userId);
        if (profile.isPresent()) {
            var p = profile.get();
            if (p.getInstitution() != null) score += 12;
            if (p.getDegree() != null) score += 5;
            if (p.getDepartment() != null) score += 5;
            if (p.getGraduationYear() != null) score += 3;
            if (p.getCgpa() != null) score += 5;
            if (p.getAboutMe() != null && !p.getAboutMe().isBlank()) score += 8;
            if (p.getUsername() != null) score += 2;
        }

        long skillCount = studentSkillRepository.findByUserId(userId).size();
        score += Math.min(skillCount * 3, 20);

        long projectCount = studentProjectRepository.findByUserId(userId).size();
        score += Math.min(projectCount * 5, 15);

        long certCount = studentCertificationRepository.findByUserId(userId).size();
        score += Math.min(certCount * 5, 10);

        long achieveCount = studentAchievementRepository.findByUserIdOrderByAchievementDateDesc(userId).size();
        score += Math.min(achieveCount * 3, 5);

        var prefs = studentCareerPreferencesRepository.findByUserId(userId);
        if (prefs.isPresent()) {
            if (prefs.get().getPreferredRoles() != null) score += 4;
            if (prefs.get().getPreferredWorkType() != null) score += 3;
        }

        long linkCount = studentLinkRepository.findByUserId(userId).size();
        score += Math.min(linkCount * 2, 5);

        return Math.min(score, 100);
    }

    public StudentProfile getPublicProfile(String username) {
        StudentProfile profile = studentProfileRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        return profile;
    }
}
