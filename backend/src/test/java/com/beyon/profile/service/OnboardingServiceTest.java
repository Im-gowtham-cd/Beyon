package com.beyon.profile.service;

import com.beyon.common.exception.ConflictException;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.identity.enums.AccountStatus;
import com.beyon.identity.enums.UserRole;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.institution.repository.InstitutionStudentRepository;
import com.beyon.profile.dto.CompanyOnboardingRequest;
import com.beyon.profile.dto.InstitutionOnboardingRequest;
import com.beyon.profile.dto.StudentOnboardingRequest;
import com.beyon.profile.enums.SkillProficiency;
import com.beyon.profile.model.CompanyProfile;
import com.beyon.profile.model.InstitutionProfile;
import com.beyon.profile.model.StudentProfile;
import com.beyon.profile.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OnboardingServiceTest {

    private UserRepository userRepository;
    private StudentProfileRepository studentProfileRepository;
    private StudentSkillRepository studentSkillRepository;
    private StudentCertificationRepository studentCertificationRepository;
    private StudentProjectRepository studentProjectRepository;
    private StudentLinkRepository studentLinkRepository;
    private InstitutionProfileRepository institutionProfileRepository;
    private InstitutionStudentRepository institutionStudentRepository;
    private InstitutionPlacementHistoryRepository institutionPlacementHistoryRepository;
    private InstitutionRepresentativeRepository institutionRepresentativeRepository;
    private CompanyProfileRepository companyProfileRepository;
    private CompanyHiringPreferenceRepository companyHiringPreferenceRepository;
    private CompanySkillRepository companySkillRepository;
    private CompanyRepresentativeRepository companyRepresentativeRepository;

    private OnboardingService onboardingService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        studentProfileRepository = mock(StudentProfileRepository.class);
        studentSkillRepository = mock(StudentSkillRepository.class);
        studentCertificationRepository = mock(StudentCertificationRepository.class);
        studentProjectRepository = mock(StudentProjectRepository.class);
        studentLinkRepository = mock(StudentLinkRepository.class);
        institutionProfileRepository = mock(InstitutionProfileRepository.class);
        institutionStudentRepository = mock(InstitutionStudentRepository.class);
        institutionPlacementHistoryRepository = mock(InstitutionPlacementHistoryRepository.class);
        institutionRepresentativeRepository = mock(InstitutionRepresentativeRepository.class);
        companyProfileRepository = mock(CompanyProfileRepository.class);
        companyHiringPreferenceRepository = mock(CompanyHiringPreferenceRepository.class);
        companySkillRepository = mock(CompanySkillRepository.class);
        companyRepresentativeRepository = mock(CompanyRepresentativeRepository.class);

        onboardingService = new OnboardingService(
                userRepository,
                studentProfileRepository,
                studentSkillRepository,
                studentCertificationRepository,
                studentProjectRepository,
                studentLinkRepository,
                institutionProfileRepository,
                institutionStudentRepository,
                institutionPlacementHistoryRepository,
                institutionRepresentativeRepository,
                companyProfileRepository,
                companyHiringPreferenceRepository,
                companySkillRepository,
                companyRepresentativeRepository
        );
    }

    @Test
    @DisplayName("createStudentProfile creates student profile and saves skills")
    void testCreateStudentProfileSuccess() {
        UUID studentId = UUID.randomUUID();
        User user = new User();
        user.setId(studentId);
        user.setRole(UserRole.STUDENT);

        StudentOnboardingRequest req = new StudentOnboardingRequest();
        req.setDegree("B.Tech");
        req.setDepartment("Computer Science");
        req.setCgpa(new java.math.BigDecimal("8.8"));

        StudentOnboardingRequest.SkillEntry skill = new StudentOnboardingRequest.SkillEntry();
        skill.setSkillName("Java");
        skill.setProficiency(SkillProficiency.ADVANCED);
        req.setSkills(List.of(skill));

        when(userRepository.findById(studentId)).thenReturn(Optional.of(user));
        when(studentProfileRepository.existsByUserId(studentId)).thenReturn(false);

        onboardingService.createStudentProfile(studentId, req);

        verify(studentProfileRepository).save(any(StudentProfile.class));
        verify(studentSkillRepository).save(any());
        verify(userRepository).save(user);
        assertEquals(AccountStatus.COMPLETED, user.getProfileStatus());
    }

    @Test
    @DisplayName("createStudentProfile throws ConflictException when user is not in student tier")
    void testCreateStudentProfileWrongRole() {
        UUID companyUserId = UUID.randomUUID();
        User user = new User();
        user.setId(companyUserId);
        user.setRole(UserRole.COMPANY_ADMIN);

        when(userRepository.findById(companyUserId)).thenReturn(Optional.of(user));

        assertThrows(ConflictException.class, () ->
                onboardingService.createStudentProfile(companyUserId, new StudentOnboardingRequest()));
        verify(studentProfileRepository, never()).save(any());
    }

    @Test
    @DisplayName("createStudentProfile throws ConflictException when profile already exists")
    void testCreateStudentProfileDuplicate() {
        UUID studentId = UUID.randomUUID();
        User user = new User();
        user.setId(studentId);
        user.setRole(UserRole.STUDENT);

        when(userRepository.findById(studentId)).thenReturn(Optional.of(user));
        when(studentProfileRepository.existsByUserId(studentId)).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                onboardingService.createStudentProfile(studentId, new StudentOnboardingRequest()));
    }

    @Test
    @DisplayName("createInstitutionProfile saves institution profile and sets status to pending verification")
    void testCreateInstitutionProfileSuccess() {
        UUID instId = UUID.randomUUID();
        User user = new User();
        user.setId(instId);
        user.setRole(UserRole.INSTITUTION_ADMIN);

        InstitutionOnboardingRequest req = new InstitutionOnboardingRequest();
        req.setInstitutionName("Stanford Institute of Technology");
        req.setOfficialEmail("contact@stanford.edu");

        when(userRepository.findById(instId)).thenReturn(Optional.of(user));
        when(institutionProfileRepository.existsByUserId(instId)).thenReturn(false);

        onboardingService.createInstitutionProfile(instId, req);

        verify(institutionProfileRepository).save(any(InstitutionProfile.class));
        verify(userRepository).save(user);
        assertEquals(AccountStatus.PENDING_INSTITUTION_VERIFICATION, user.getProfileStatus());
    }

    @Test
    @DisplayName("createCompanyProfile saves company profile and updates status")
    void testCreateCompanyProfileSuccess() {
        UUID compId = UUID.randomUUID();
        User user = new User();
        user.setId(compId);
        user.setRole(UserRole.COMPANY_ADMIN);

        CompanyOnboardingRequest req = new CompanyOnboardingRequest();
        req.setCompanyName("Acme Cloud Corp");
        req.setIndustry("Technology");

        when(userRepository.findById(compId)).thenReturn(Optional.of(user));
        when(companyProfileRepository.existsByUserId(compId)).thenReturn(false);

        onboardingService.createCompanyProfile(compId, req);

        verify(companyProfileRepository).save(any(CompanyProfile.class));
        verify(userRepository).save(user);
    }
}
