package com.beyon.institution.service;

import com.beyon.common.exception.ConflictException;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.identity.enums.AccountStatus;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.institution.model.InstitutionStudent;
import com.beyon.institution.model.PlacementRecord;
import com.beyon.institution.repository.InstitutionPlacementRecordRepository;
import com.beyon.institution.repository.InstitutionRatingSnapshotRepository;
import com.beyon.institution.repository.InstitutionStudentRepository;
import com.beyon.institution.repository.PlacementDriveRepository;
import com.beyon.practice.repository.CompanyOpportunityRepository;
import com.beyon.profile.repository.CompanyProfileRepository;
import com.beyon.profile.repository.StudentProfileRepository;
import com.beyon.recruitment.repository.RecruitmentApplicationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InstitutionServiceTest {

    private InstitutionStudentRepository institutionStudentRepository;
    private InstitutionPlacementRecordRepository placementRecordRepository;
    private InstitutionRatingSnapshotRepository ratingRepository;
    private PlacementDriveRepository placementDriveRepository;
    private UserRepository userRepository;
    private StudentProfileRepository studentProfileRepository;
    private CompanyOpportunityRepository opportunityRepository;
    private CompanyProfileRepository companyProfileRepository;
    private RecruitmentApplicationRepository recruitmentApplicationRepository;
    private com.beyon.recruitment.repository.PlacementRecordRepository recruitmentPlacementRecordRepository;

    private InstitutionService institutionService;

    @BeforeEach
    void setUp() {
        institutionStudentRepository = mock(InstitutionStudentRepository.class);
        placementRecordRepository = mock(InstitutionPlacementRecordRepository.class);
        ratingRepository = mock(InstitutionRatingSnapshotRepository.class);
        placementDriveRepository = mock(PlacementDriveRepository.class);
        userRepository = mock(UserRepository.class);
        studentProfileRepository = mock(StudentProfileRepository.class);
        opportunityRepository = mock(CompanyOpportunityRepository.class);
        companyProfileRepository = mock(CompanyProfileRepository.class);
        recruitmentApplicationRepository = mock(RecruitmentApplicationRepository.class);
        recruitmentPlacementRecordRepository = mock(com.beyon.recruitment.repository.PlacementRecordRepository.class);

        institutionService = new InstitutionService(
                institutionStudentRepository,
                placementRecordRepository,
                ratingRepository,
                placementDriveRepository,
                userRepository,
                studentProfileRepository,
                opportunityRepository,
                companyProfileRepository,
                recruitmentApplicationRepository,
                recruitmentPlacementRecordRepository
        );
    }

    @Test
    @DisplayName("addStudent successfully links student to institution")
    void testAddStudentSuccess() {
        UUID instId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        when(institutionStudentRepository.findByInstitutionIdAndStudentId(instId, studentId))
                .thenReturn(Optional.empty());
        when(institutionStudentRepository.save(any(InstitutionStudent.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        InstitutionStudent created = institutionService.addStudent(instId, studentId, "CSE", "2026");

        assertNotNull(created);
        assertEquals(instId, created.getInstitutionId());
        assertEquals(studentId, created.getStudentId());
        assertEquals("CSE", created.getDepartment());
        assertEquals("2026", created.getBatch());
        verify(institutionStudentRepository).save(any(InstitutionStudent.class));
    }

    @Test
    @DisplayName("addStudent throws ConflictException when student already linked")
    void testAddStudentDuplicateConflict() {
        UUID instId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        when(institutionStudentRepository.findByInstitutionIdAndStudentId(instId, studentId))
                .thenReturn(Optional.of(new InstitutionStudent()));

        assertThrows(ConflictException.class, () ->
                institutionService.addStudent(instId, studentId, "CSE", "2026"));
        verify(institutionStudentRepository, never()).save(any());
    }

    @Test
    @DisplayName("verifyStudent sets verified true and profileStatus COMPLETED when approved")
    void testVerifyStudentApproved() {
        UUID instId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        InstitutionStudent is = new InstitutionStudent();
        is.setInstitutionId(instId);
        is.setStudentId(studentId);
        is.setVerified(false);

        User user = new User();
        user.setId(studentId);
        user.setProfileStatus(AccountStatus.INCOMPLETE);

        when(institutionStudentRepository.findByInstitutionIdAndStudentId(instId, studentId))
                .thenReturn(Optional.of(is));
        when(userRepository.findById(studentId)).thenReturn(Optional.of(user));
        when(institutionStudentRepository.save(any(InstitutionStudent.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        InstitutionStudent result = institutionService.verifyStudent(instId, studentId, true, "All documents verified");

        assertTrue(result.isVerified());
        assertEquals("PLACEMENT_SEEKING", result.getPlacementStatus());
        assertEquals(AccountStatus.COMPLETED, user.getProfileStatus());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("verifyStudent sets verified false and profileStatus REJECTED when rejected")
    void testVerifyStudentRejected() {
        UUID instId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        InstitutionStudent is = new InstitutionStudent();
        is.setInstitutionId(instId);
        is.setStudentId(studentId);

        User user = new User();
        user.setId(studentId);

        when(institutionStudentRepository.findByInstitutionIdAndStudentId(instId, studentId))
                .thenReturn(Optional.of(is));
        when(userRepository.findById(studentId)).thenReturn(Optional.of(user));
        when(institutionStudentRepository.save(any(InstitutionStudent.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        InstitutionStudent result = institutionService.verifyStudent(instId, studentId, false, "Invalid transcripts");

        assertFalse(result.isVerified());
        assertEquals("REJECTED", result.getPlacementStatus());
        assertEquals(AccountStatus.REJECTED, user.getProfileStatus());
    }

    @Test
    @DisplayName("verifyStudent throws ResourceNotFoundException when student not in institution")
    void testVerifyStudentNotFound() {
        UUID instId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        when(institutionStudentRepository.findByInstitutionIdAndStudentId(instId, studentId))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                institutionService.verifyStudent(instId, studentId, true, ""));
    }

    @Test
    @DisplayName("getInstitutionMetrics correctly aggregates student and placement figures")
    void testGetInstitutionMetrics() {
        UUID instId = UUID.randomUUID();

        when(institutionStudentRepository.countByInstitutionId(instId)).thenReturn(100L);
        when(institutionStudentRepository.countByInstitutionIdAndPlacementStatus(instId, "PLACED")).thenReturn(80L);
        when(institutionStudentRepository.countByInstitutionIdAndPlacementStatus(instId, "PLACEMENT_SEEKING")).thenReturn(20L);

        PlacementRecord r1 = new PlacementRecord();
        r1.setCompanyName("Google");
        r1.setPackageLpa(new BigDecimal("25.0"));
        r1.setCompanyTier("TIER_1");

        PlacementRecord r2 = new PlacementRecord();
        r2.setCompanyName("Microsoft");
        r2.setPackageLpa(new BigDecimal("35.0"));
        r2.setCompanyTier("TIER_1");

        when(placementRecordRepository.findByInstitutionId(instId)).thenReturn(List.of(r1, r2));

        Map<String, Object> metrics = institutionService.getInstitutionMetrics(instId);

        assertEquals(100L, metrics.get("totalStudents"));
        assertEquals(80L, metrics.get("studentsPlaced"));
        assertEquals(80.0, (Double) metrics.get("placementPercentage"), 0.001);
        assertEquals(30.0, (Double) metrics.get("averagePackage"), 0.001);
        assertEquals(35.0, (Double) metrics.get("highestPackage"), 0.001);
        assertEquals(2L, metrics.get("tier1Placements"));
        assertEquals(2, metrics.get("companiesVisited"));
    }
}
