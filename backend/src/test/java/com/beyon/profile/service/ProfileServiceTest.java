package com.beyon.profile.service;

import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.identity.enums.AccountStatus;
import com.beyon.identity.enums.UserRole;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.profile.dto.ProfileResponse;
import com.beyon.profile.model.*;
import com.beyon.profile.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProfileServiceTest {

    private UserRepository userRepository;
    private StudentProfileRepository studentProfileRepository;
    private StudentSkillRepository studentSkillRepository;
    private StudentCertificationRepository studentCertificationRepository;
    private StudentProjectRepository studentProjectRepository;
    private StudentLinkRepository studentLinkRepository;
    private StudentAchievementRepository studentAchievementRepository;
    private StudentLearningSkillRepository studentLearningSkillRepository;
    private StudentCareerPreferencesRepository studentCareerPreferencesRepository;
    private InstitutionProfileRepository institutionProfileRepository;
    private InstitutionPlacementHistoryRepository institutionPlacementHistoryRepository;
    private InstitutionRepresentativeRepository institutionRepresentativeRepository;
    private CompanyProfileRepository companyProfileRepository;
    private CompanyHiringPreferenceRepository companyHiringPreferenceRepository;
    private CompanySkillRepository companySkillRepository;
    private CompanyRepresentativeRepository companyRepresentativeRepository;

    private ProfileService profileService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        studentProfileRepository = mock(StudentProfileRepository.class);
        studentSkillRepository = mock(StudentSkillRepository.class);
        studentCertificationRepository = mock(StudentCertificationRepository.class);
        studentProjectRepository = mock(StudentProjectRepository.class);
        studentLinkRepository = mock(StudentLinkRepository.class);
        studentAchievementRepository = mock(StudentAchievementRepository.class);
        studentLearningSkillRepository = mock(StudentLearningSkillRepository.class);
        studentCareerPreferencesRepository = mock(StudentCareerPreferencesRepository.class);
        institutionProfileRepository = mock(InstitutionProfileRepository.class);
        institutionPlacementHistoryRepository = mock(InstitutionPlacementHistoryRepository.class);
        institutionRepresentativeRepository = mock(InstitutionRepresentativeRepository.class);
        companyProfileRepository = mock(CompanyProfileRepository.class);
        companyHiringPreferenceRepository = mock(CompanyHiringPreferenceRepository.class);
        companySkillRepository = mock(CompanySkillRepository.class);
        companyRepresentativeRepository = mock(CompanyRepresentativeRepository.class);

        profileService = new ProfileService(
                userRepository,
                studentProfileRepository,
                studentSkillRepository,
                studentCertificationRepository,
                studentProjectRepository,
                studentLinkRepository,
                studentAchievementRepository,
                studentLearningSkillRepository,
                studentCareerPreferencesRepository,
                institutionProfileRepository,
                institutionPlacementHistoryRepository,
                institutionRepresentativeRepository,
                companyProfileRepository,
                companyHiringPreferenceRepository,
                companySkillRepository,
                companyRepresentativeRepository
        );
    }

    @Test
    @DisplayName("getProfile for Student loads student profile data and calculates completion")
    void testGetStudentProfile() {
        UUID studentId = UUID.randomUUID();
        User user = new User();
        user.setId(studentId);
        user.setEmail("student@beyon.test");
        user.setRole(UserRole.STUDENT);
        user.setStatus(AccountStatus.ACTIVE);

        StudentProfile sp = new StudentProfile();
        sp.setUserId(studentId);
        sp.setCompletionPct(85);

        when(userRepository.findById(studentId)).thenReturn(Optional.of(user));
        when(studentProfileRepository.findByUserId(studentId)).thenReturn(Optional.of(sp));
        when(studentSkillRepository.findByUserId(studentId)).thenReturn(List.of(new StudentSkill()));
        when(studentProjectRepository.findByUserId(studentId)).thenReturn(List.of(new StudentProject()));

        ProfileResponse resp = profileService.getProfile(studentId);

        assertNotNull(resp);
        assertNotNull(resp.getStudentProfile());
        assertEquals(85, resp.getStudentProfile().getProfile().getCompletionPct());
        assertEquals(1, resp.getStudentProfile().getSkills().size());
        assertEquals(1, resp.getStudentProfile().getProjects().size());
        assertTrue(resp.getUser().isProfileCompleted());
    }

    @Test
    @DisplayName("getProfile for Institution loads institution data and representatives")
    void testGetInstitutionProfile() {
        UUID instId = UUID.randomUUID();
        User user = new User();
        user.setId(instId);
        user.setRole(UserRole.INSTITUTION_ADMIN);

        InstitutionProfile ip = new InstitutionProfile();
        ip.setUserId(instId);
        ip.setInstitutionName("National Tech University");
        ip.setCompletionPct(90);

        when(userRepository.findById(instId)).thenReturn(Optional.of(user));
        when(institutionProfileRepository.findByUserId(instId)).thenReturn(Optional.of(ip));
        when(institutionRepresentativeRepository.findByUserId(instId)).thenReturn(List.of(new InstitutionRepresentative()));

        ProfileResponse resp = profileService.getProfile(instId);

        assertNotNull(resp);
        assertNotNull(resp.getInstitutionProfile());
        assertEquals("National Tech University", resp.getInstitutionProfile().getProfile().getInstitutionName());
        assertEquals(1, resp.getInstitutionProfile().getRepresentatives().size());
        assertTrue(resp.getUser().isProfileCompleted());
    }

    @Test
    @DisplayName("getProfile for Company loads company profile, hiring preferences and skills")
    void testGetCompanyProfile() {
        UUID companyId = UUID.randomUUID();
        User user = new User();
        user.setId(companyId);
        user.setRole(UserRole.COMPANY_RECRUITER);

        CompanyProfile cp = new CompanyProfile();
        cp.setUserId(companyId);
        cp.setCompanyName("Beyon Global Systems");
        cp.setCompletionPct(75);

        when(userRepository.findById(companyId)).thenReturn(Optional.of(user));
        when(companyProfileRepository.findByUserId(companyId)).thenReturn(Optional.of(cp));
        when(companyHiringPreferenceRepository.findByUserId(companyId)).thenReturn(Optional.of(new CompanyHiringPreference()));
        when(companySkillRepository.findByUserId(companyId)).thenReturn(List.of(new CompanySkill()));

        ProfileResponse resp = profileService.getProfile(companyId);

        assertNotNull(resp);
        assertNotNull(resp.getCompanyProfile());
        assertEquals("Beyon Global Systems", resp.getCompanyProfile().getProfile().getCompanyName());
        assertEquals(1, resp.getCompanyProfile().getSkills().size());
        assertFalse(resp.getUser().isProfileCompleted()); // 75 < 80
    }

    @Test
    @DisplayName("getProfile throws ResourceNotFoundException when user is not in database")
    void testGetProfileNotFound() {
        UUID unknownId = UUID.randomUUID();
        when(userRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> profileService.getProfile(unknownId));
    }
}
