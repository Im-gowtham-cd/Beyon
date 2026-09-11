package com.beyon.platform.service;

import com.beyon.identity.enums.UserRole;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.platform.repository.PermissionRepository;
import com.beyon.platform.repository.RolePermissionsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class PermissionServiceTest {

    private UserRepository userRepository;
    private PermissionRepository permissionRepository;
    private RolePermissionsRepository rolePermissionsRepository;
    private PermissionService permissionService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        permissionRepository = Mockito.mock(PermissionRepository.class);
        rolePermissionsRepository = Mockito.mock(RolePermissionsRepository.class);
        permissionService = new PermissionService(permissionRepository, rolePermissionsRepository, userRepository);
    }

    @Test
    @DisplayName("Super Admin / Platform Admin should have platform governance permissions")
    void testSuperAdminPermissions() {
        UUID adminId = UUID.randomUUID();
        User admin = new User();
        admin.setId(adminId);
        admin.setRole(UserRole.PLATFORM_ADMIN);

        when(userRepository.findById(adminId)).thenReturn(Optional.of(admin));

        assertTrue(permissionService.hasPermission(adminId, "platform:config"));
        assertTrue(permissionService.hasPermission(adminId, "platform:settings"));
        assertTrue(permissionService.hasPermission(adminId, "institution:approve"));
        assertTrue(permissionService.hasPermission(adminId, "company:approve"));
        assertTrue(permissionService.hasPermission(adminId, "job:moderate"));
        assertTrue(permissionService.hasPermission(adminId, "student:read"));
    }

    @Test
    @DisplayName("Verification Admin can verify institutions and students, but cannot configure platform")
    void testVerificationAdminPermissions() {
        UUID verifAdminId = UUID.randomUUID();
        User verifAdmin = new User();
        verifAdmin.setId(verifAdminId);
        verifAdmin.setRole(UserRole.VERIFICATION_ADMIN);

        when(userRepository.findById(verifAdminId)).thenReturn(Optional.of(verifAdmin));

        assertTrue(permissionService.hasPermission(verifAdminId, "institution:verify"));
        assertTrue(permissionService.hasPermission(verifAdminId, "company:verify"));
        assertTrue(permissionService.hasPermission(verifAdminId, "student:verify"));
        assertTrue(permissionService.hasPermission(verifAdminId, "certificate:verify"));
        assertFalse(permissionService.hasPermission(verifAdminId, "platform:config"));
        assertFalse(permissionService.hasPermission(verifAdminId, "question:create"));
    }

    @Test
    @DisplayName("Question Setter can create MCQ/coding questions, but cannot modify student skill scores")
    void testQuestionSetterPermissions() {
        UUID setterId = UUID.randomUUID();
        User setter = new User();
        setter.setId(setterId);
        setter.setRole(UserRole.QUESTION_SETTER);

        when(userRepository.findById(setterId)).thenReturn(Optional.of(setter));

        assertTrue(permissionService.hasPermission(setterId, "question:create"));
        assertTrue(permissionService.hasPermission(setterId, "question:mcq_create"));
        assertTrue(permissionService.hasPermission(setterId, "question:coding_create"));
        assertTrue(permissionService.hasPermission(setterId, "assessment:create"));
        assertTrue(permissionService.hasPermission(setterId, "student_answers:read_only"));
        assertFalse(permissionService.hasPermission(setterId, "skill_score:modify"));
        assertFalse(permissionService.hasPermission(setterId, "student_profile:read"));
        assertFalse(permissionService.hasPermission(setterId, "job:create"));
    }

    @Test
    @DisplayName("Company Recruiter has job creation and shortlist rights but cannot approve institutions")
    void testCompanyRecruiterPermissions() {
        UUID recruiterId = UUID.randomUUID();
        User recruiter = new User();
        recruiter.setId(recruiterId);
        recruiter.setRole(UserRole.COMPANY_RECRUITER);

        when(userRepository.findById(recruiterId)).thenReturn(Optional.of(recruiter));

        assertTrue(permissionService.hasPermission(recruiterId, "job:create"));
        assertTrue(permissionService.hasPermission(recruiterId, "application:shortlist"));
        assertTrue(permissionService.hasPermission(recruiterId, "interview:schedule"));
        assertFalse(permissionService.hasPermission(recruiterId, "institution:approve"));
        assertFalse(permissionService.hasPermission(recruiterId, "student:verify"));
    }

    @Test
    @DisplayName("Company HR handles communication and offers, but cannot manage question bank")
    void testCompanyHrPermissions() {
        UUID hrId = UUID.randomUUID();
        User hr = new User();
        hr.setId(hrId);
        hr.setRole(UserRole.COMPANY_HR);

        when(userRepository.findById(hrId)).thenReturn(Optional.of(hr));

        assertTrue(permissionService.hasPermission(hrId, "application:read"));
        assertTrue(permissionService.hasPermission(hrId, "candidate_communication:manage"));
        assertTrue(permissionService.hasPermission(hrId, "offer:create"));
        assertTrue(permissionService.hasPermission(hrId, "offer:manage"));
        assertFalse(permissionService.hasPermission(hrId, "question_bank:manage"));
        assertFalse(permissionService.hasPermission(hrId, "company:settings"));
    }

    @Test
    @DisplayName("Company Interviewer can conduct and evaluate interviews, but cannot create jobs or offers")
    void testCompanyInterviewerPermissions() {
        UUID interviewerId = UUID.randomUUID();
        User interviewer = new User();
        interviewer.setId(interviewerId);
        interviewer.setRole(UserRole.COMPANY_INTERVIEWER);

        when(userRepository.findById(interviewerId)).thenReturn(Optional.of(interviewer));

        assertTrue(permissionService.hasPermission(interviewerId, "interview:conduct"));
        assertTrue(permissionService.hasPermission(interviewerId, "interview:evaluate"));
        assertTrue(permissionService.hasPermission(interviewerId, "feedback:submit"));
        assertFalse(permissionService.hasPermission(interviewerId, "job:create"));
        assertFalse(permissionService.hasPermission(interviewerId, "offer:create"));
        assertFalse(permissionService.hasPermission(interviewerId, "applications:manage"));
    }

    @Test
    @DisplayName("Institution Admin has student verification rights but cannot create company jobs")
    void testInstitutionAdminPermissions() {
        UUID instId = UUID.randomUUID();
        User instAdmin = new User();
        instAdmin.setId(instId);
        instAdmin.setRole(UserRole.INSTITUTION_ADMIN);

        when(userRepository.findById(instId)).thenReturn(Optional.of(instAdmin));

        assertTrue(permissionService.hasPermission(instId, "student:verify"));
        assertTrue(permissionService.hasPermission(instId, "placement:verify"));
        assertTrue(permissionService.hasPermission(instId, "drives:manage"));
        assertFalse(permissionService.hasPermission(instId, "job:create"));
        assertFalse(permissionService.hasPermission(instId, "company:approve"));
    }

    @Test
    @DisplayName("Institution boundary isolation: admin cannot verify students belonging to a different college")
    void testInstitutionScopeIsolation() {
        UUID instUserAId = UUID.randomUUID();
        UUID collegeAId = UUID.randomUUID();
        UUID collegeBId = UUID.randomUUID();

        User instUserA = new User();
        instUserA.setId(instUserAId);
        instUserA.setRole(UserRole.INSTITUTION_ADMIN);
        instUserA.setInstitutionId(collegeAId);

        when(userRepository.findById(instUserAId)).thenReturn(Optional.of(instUserA));

        // Allowed for own institution
        assertTrue(permissionService.hasPermission(instUserAId, "student", "verify", collegeAId));

        // Denied for different institution
        assertFalse(permissionService.hasPermission(instUserAId, "student", "verify", collegeBId));
    }

    @Test
    @DisplayName("Company boundary isolation: recruiter cannot manage pipelines of a competitor company")
    void testCompanyScopeIsolation() {
        UUID recruiterId = UUID.randomUUID();
        UUID companyTcsId = UUID.randomUUID();
        UUID companyInfosysId = UUID.randomUUID();

        User recruiter = new User();
        recruiter.setId(recruiterId);
        recruiter.setRole(UserRole.COMPANY_RECRUITER);
        recruiter.setCompanyId(companyTcsId);

        when(userRepository.findById(recruiterId)).thenReturn(Optional.of(recruiter));

        // Allowed for TCS
        assertTrue(permissionService.hasPermission(recruiterId, "application", "shortlist", companyTcsId));

        // Denied for Infosys
        assertFalse(permissionService.hasPermission(recruiterId, "application", "shortlist", companyInfosysId));
    }

    @Test
    @DisplayName("4-Part CheckAccess: Interviewer can only evaluate assigned candidate interviews")
    void testCheckAccessInterviewerResourceOwnership() {
        UUID interviewerId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();

        User interviewer = new User();
        interviewer.setId(interviewerId);
        interviewer.setRole(UserRole.COMPANY_INTERVIEWER);
        interviewer.setCompanyId(companyId);

        when(userRepository.findById(interviewerId)).thenReturn(Optional.of(interviewer));

        // Allowed when interviewer is the assigned evaluator
        assertTrue(permissionService.checkAccess(interviewerId, "interview", "evaluate", companyId, interviewerId));

        // Denied when interviewer is NOT the assigned evaluator
        UUID otherInterviewerId = UUID.randomUUID();
        assertFalse(permissionService.checkAccess(interviewerId, "interview", "evaluate", companyId, otherInterviewerId));
    }

    @Test
    @DisplayName("Student permissions: can take assessments and apply, but cannot publish jobs or verify students")
    void testStudentPermissions() {
        UUID studentId = UUID.randomUUID();
        User student = new User();
        student.setId(studentId);
        student.setRole(UserRole.STUDENT);

        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));

        assertTrue(permissionService.hasPermission(studentId, "assessment:take"));
        assertTrue(permissionService.hasPermission(studentId, "application:create"));
        assertTrue(permissionService.hasPermission(studentId, "course:learn"));
        assertFalse(permissionService.hasPermission(studentId, "job:create"));
        assertFalse(permissionService.hasPermission(studentId, "student:verify"));
    }
}
