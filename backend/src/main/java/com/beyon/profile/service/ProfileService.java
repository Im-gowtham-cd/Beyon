package com.beyon.profile.service;

import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.profile.dto.ProfileResponse;
import com.beyon.profile.model.*;
import com.beyon.profile.repository.*;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final StudentCertificationRepository studentCertificationRepository;
    private final StudentProjectRepository studentProjectRepository;
    private final StudentLinkRepository studentLinkRepository;
    private final StudentAchievementRepository studentAchievementRepository;
    private final StudentLearningSkillRepository studentLearningSkillRepository;
    private final StudentCareerPreferencesRepository studentCareerPreferencesRepository;
    private final InstitutionProfileRepository institutionProfileRepository;
    private final InstitutionPlacementHistoryRepository institutionPlacementHistoryRepository;
    private final InstitutionRepresentativeRepository institutionRepresentativeRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final CompanyHiringPreferenceRepository companyHiringPreferenceRepository;
    private final CompanySkillRepository companySkillRepository;
    private final CompanyRepresentativeRepository companyRepresentativeRepository;

    public ProfileService(UserRepository userRepository,
                          StudentProfileRepository studentProfileRepository,
                          StudentSkillRepository studentSkillRepository,
                          StudentCertificationRepository studentCertificationRepository,
                          StudentProjectRepository studentProjectRepository,
                          StudentLinkRepository studentLinkRepository,
                          StudentAchievementRepository studentAchievementRepository,
                          StudentLearningSkillRepository studentLearningSkillRepository,
                          StudentCareerPreferencesRepository studentCareerPreferencesRepository,
                          InstitutionProfileRepository institutionProfileRepository,
                          InstitutionPlacementHistoryRepository institutionPlacementHistoryRepository,
                          InstitutionRepresentativeRepository institutionRepresentativeRepository,
                          CompanyProfileRepository companyProfileRepository,
                          CompanyHiringPreferenceRepository companyHiringPreferenceRepository,
                          CompanySkillRepository companySkillRepository,
                          CompanyRepresentativeRepository companyRepresentativeRepository) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.studentCertificationRepository = studentCertificationRepository;
        this.studentProjectRepository = studentProjectRepository;
        this.studentLinkRepository = studentLinkRepository;
        this.studentAchievementRepository = studentAchievementRepository;
        this.studentLearningSkillRepository = studentLearningSkillRepository;
        this.studentCareerPreferencesRepository = studentCareerPreferencesRepository;
        this.institutionProfileRepository = institutionProfileRepository;
        this.institutionPlacementHistoryRepository = institutionPlacementHistoryRepository;
        this.institutionRepresentativeRepository = institutionRepresentativeRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.companyHiringPreferenceRepository = companyHiringPreferenceRepository;
        this.companySkillRepository = companySkillRepository;
        this.companyRepresentativeRepository = companyRepresentativeRepository;
    }

    public ProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ProfileResponse response = new ProfileResponse();
        boolean profileCompleted = false;

        if (user.getRole() != null && user.getRole().isStudentTier()) {
            var studentProfile = studentProfileRepository.findByUserId(userId);
            profileCompleted = studentProfile.isPresent() && studentProfile.get().getCompletionPct() >= 80;
            response.setStudentProfile(loadStudentData(userId));
        } else if (user.getRole() != null && user.getRole().isInstitutionTier()) {
            var instData = loadInstitutionData(userId, user);
            profileCompleted = instData.getProfile() != null && instData.getProfile().getCompletionPct() >= 80;
            response.setInstitutionProfile(instData);
        } else if (user.getRole() != null && user.getRole().isCompanyTier()) {
            var compProfile = companyProfileRepository.findByUserId(userId);
            profileCompleted = compProfile.isPresent() && compProfile.get().getCompletionPct() >= 80;
            response.setCompanyProfile(loadCompanyData(userId));
        } else {
            profileCompleted = true;
        }

        response.setUser(new ProfileResponse.UserInfo(user, profileCompleted));
        return response;
    }

    private ProfileResponse.StudentProfileData loadStudentData(UUID userId) {
        ProfileResponse.StudentProfileData data = new ProfileResponse.StudentProfileData();
        studentProfileRepository.findByUserId(userId).ifPresent(data::setProfile);
        data.setSkills(studentSkillRepository.findByUserId(userId));
        data.setCertifications(studentCertificationRepository.findByUserId(userId));
        data.setProjects(studentProjectRepository.findByUserId(userId));
        data.setLinks(studentLinkRepository.findByUserId(userId));
        data.setAchievements(studentAchievementRepository.findByUserIdOrderByAchievementDateDesc(userId));
        data.setLearningSkills(studentLearningSkillRepository.findByUserIdOrderByCreatedAtDesc(userId));
        data.setCareerPreferences(studentCareerPreferencesRepository.findByUserId(userId).orElse(null));
        return data;
    }

    private ProfileResponse.InstitutionProfileData loadInstitutionData(UUID userId, User user) {
        ProfileResponse.InstitutionProfileData data = new ProfileResponse.InstitutionProfileData();
        UUID effectiveInstId = (user != null && user.getInstitutionId() != null) ? user.getInstitutionId() : userId;
        var optProfile = institutionProfileRepository.findByUserId(userId);
        if (optProfile.isEmpty() && !effectiveInstId.equals(userId)) {
            optProfile = institutionProfileRepository.findByUserId(effectiveInstId);
        }
        if (optProfile.isEmpty() && user != null && user.getDisplayName() != null) {
            String name = user.getDisplayName().trim();
            for (com.beyon.profile.model.InstitutionProfile ip : institutionProfileRepository.findAll()) {
                if (ip.getInstitutionName() != null &&
                        (ip.getInstitutionName().equalsIgnoreCase(name) ||
                                ip.getInstitutionName().toLowerCase().contains(name.toLowerCase()) ||
                                name.toLowerCase().contains(ip.getInstitutionName().toLowerCase()))) {
                    optProfile = Optional.of(ip);
                    effectiveInstId = ip.getUserId();
                    break;
                }
            }
        }
        optProfile.ifPresent(data::setProfile);
        data.setPlacementHistory(institutionPlacementHistoryRepository.findByUserId(effectiveInstId));
        data.setRepresentatives(institutionRepresentativeRepository.findByUserId(effectiveInstId));
        return data;
    }

    private ProfileResponse.CompanyProfileData loadCompanyData(UUID userId) {
        ProfileResponse.CompanyProfileData data = new ProfileResponse.CompanyProfileData();
        companyProfileRepository.findByUserId(userId).ifPresent(data::setProfile);
        companyHiringPreferenceRepository.findByUserId(userId).ifPresent(data::setHiringPreferences);
        data.setSkills(companySkillRepository.findByUserId(userId));
        data.setRepresentatives(companyRepresentativeRepository.findByUserId(userId));
        return data;
    }
}

