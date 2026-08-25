package com.beyon.profile.service;

import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.profile.dto.ProfileResponse;
import com.beyon.profile.model.*;
import com.beyon.profile.repository.*;
import org.springframework.stereotype.Service;

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

        switch (user.getRole()) {
            case STUDENT -> {
                var studentProfile = studentProfileRepository.findByUserId(userId);
                profileCompleted = studentProfile.isPresent() && studentProfile.get().getCompletionPct() >= 80;
                response.setStudentProfile(loadStudentData(userId));
            }
            case INSTITUTION -> {
                var instProfile = institutionProfileRepository.findByUserId(userId);
                profileCompleted = instProfile.isPresent() && instProfile.get().getCompletionPct() >= 80;
                response.setInstitutionProfile(loadInstitutionData(userId));
            }
            case COMPANY -> {
                var compProfile = companyProfileRepository.findByUserId(userId);
                profileCompleted = compProfile.isPresent() && compProfile.get().getCompletionPct() >= 80;
                response.setCompanyProfile(loadCompanyData(userId));
            }
            default -> profileCompleted = true;
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

    private ProfileResponse.InstitutionProfileData loadInstitutionData(UUID userId) {
        ProfileResponse.InstitutionProfileData data = new ProfileResponse.InstitutionProfileData();
        institutionProfileRepository.findByUserId(userId).ifPresent(data::setProfile);
        data.setPlacementHistory(institutionPlacementHistoryRepository.findByUserId(userId));
        data.setRepresentatives(institutionRepresentativeRepository.findByUserId(userId));
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
