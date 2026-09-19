package com.beyon.recruitment.service;

import com.beyon.identity.repository.UserRepository;
import com.beyon.institution.model.InstitutionStudent;
import com.beyon.institution.repository.InstitutionStudentRepository;
import com.beyon.practice.repository.CompanyOpportunityRepository;
import com.beyon.profile.model.StudentProfile;
import com.beyon.profile.repository.CompanyProfileRepository;
import com.beyon.profile.repository.StudentProfileRepository;
import com.beyon.recruitment.model.PlacementRecord;
import com.beyon.recruitment.model.PlacementRegistration;
import com.beyon.recruitment.repository.*;
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

class PlacementServiceTest {

    private PlacementRegistrationRepository regRepo;
    private PlacementRecordRepository recordRepo;
    private InstitutionPlacementStatsRepository statsRepo;
    private InstitutionStudentRepository institutionStudentRepository;
    private RecruitmentApplicationRepository applicationRepository;
    private CompanyOpportunityRepository opportunityRepository;
    private CompanyProfileRepository companyProfileRepository;
    private UserRepository userRepository;
    private StudentProfileRepository studentProfileRepository;

    private PlacementService placementService;

    @BeforeEach
    void setUp() {
        regRepo = mock(PlacementRegistrationRepository.class);
        recordRepo = mock(PlacementRecordRepository.class);
        statsRepo = mock(InstitutionPlacementStatsRepository.class);
        institutionStudentRepository = mock(InstitutionStudentRepository.class);
        applicationRepository = mock(RecruitmentApplicationRepository.class);
        opportunityRepository = mock(CompanyOpportunityRepository.class);
        companyProfileRepository = mock(CompanyProfileRepository.class);
        userRepository = mock(UserRepository.class);
        studentProfileRepository = mock(StudentProfileRepository.class);

        placementService = new PlacementService(
                regRepo,
                recordRepo,
                statsRepo,
                institutionStudentRepository,
                applicationRepository,
                opportunityRepository,
                companyProfileRepository,
                userRepository,
                studentProfileRepository
        );
    }

    @Test
    @DisplayName("registerOrUpdate creates registration if non-existent and persists preferences")
    void testRegisterOrUpdateNew() {
        UUID studentId = UUID.randomUUID();
        UUID instId = UUID.randomUUID();

        PlacementRegistration updates = new PlacementRegistration();
        updates.setPlacementPreference("WILLING");
        updates.setInstitutionId(instId);
        updates.setPreferredRoles("Backend Engineer");
        updates.setMinExpectedPackage(new BigDecimal("1200000"));

        when(regRepo.findByStudentId(studentId)).thenReturn(Optional.empty());
        when(regRepo.save(any(PlacementRegistration.class))).thenAnswer(inv -> inv.getArgument(0));

        PlacementRegistration result = placementService.registerOrUpdate(studentId, updates);

        assertNotNull(result);
        assertEquals(studentId, result.getStudentId());
        assertEquals("WILLING", result.getPlacementPreference());
        assertEquals(instId, result.getInstitutionId());
        assertEquals("Backend Engineer", result.getPreferredRoles());
        verify(regRepo).save(any(PlacementRegistration.class));
    }

    @Test
    @DisplayName("getMyStatusData returns isPlaced true when student has PLACED record")
    void testGetMyStatusDataPlaced() {
        UUID studentId = UUID.randomUUID();

        PlacementRegistration reg = new PlacementRegistration();
        reg.setStudentId(studentId);
        reg.setPlacementPreference("WILLING");

        PlacementRecord record = new PlacementRecord();
        record.setStudentId(studentId);
        record.setStatus("PLACED");

        InstitutionStudent is = new InstitutionStudent();
        is.setStudentId(studentId);
        is.setPlacementStatus("PLACEMENT_SEEKING");
        is.setVerified(true);
        is.setDepartment("Information Technology");

        StudentProfile sp = new StudentProfile();
        sp.setUserId(studentId);
        sp.setInstitution("MIT Campus");

        when(regRepo.findByStudentId(studentId)).thenReturn(Optional.of(reg));
        when(institutionStudentRepository.findByStudentId(studentId)).thenReturn(List.of(is));
        when(applicationRepository.findByStudentIdOrderByCreatedAtDesc(studentId)).thenReturn(List.of());
        when(recordRepo.findByStudentIdOrderByCreatedAtDesc(studentId)).thenReturn(List.of(record));
        when(studentProfileRepository.findByUserId(studentId)).thenReturn(Optional.of(sp));

        Map<String, Object> status = placementService.getMyStatusData(studentId);

        assertTrue((Boolean) status.get("isPlaced"));
        assertEquals("PLACED", status.get("placementStatus"));
        assertEquals(1L, status.get("offersReceived"));
        assertEquals("MIT Campus", status.get("institutionName"));
        assertEquals("Information Technology", status.get("department"));
    }

    @Test
    @DisplayName("createRecord persists the placement record")
    void testCreateRecord() {
        PlacementRecord record = new PlacementRecord();
        record.setStudentId(UUID.randomUUID());
        record.setJobRole("Cloud Architect");

        when(recordRepo.save(any(PlacementRecord.class))).thenAnswer(inv -> inv.getArgument(0));

        PlacementRecord saved = placementService.createRecord(record);

        assertNotNull(saved);
        assertEquals("Cloud Architect", saved.getJobRole());
        verify(recordRepo).save(record);
    }
}
