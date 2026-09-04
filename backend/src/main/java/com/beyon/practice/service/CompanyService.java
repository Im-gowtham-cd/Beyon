package com.beyon.practice.service;

import com.beyon.common.exception.ConflictException;
import com.beyon.common.exception.ForbiddenException;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.practice.model.CompanyOpportunity;
import com.beyon.practice.model.CoinWallet;
import com.beyon.practice.model.OpportunityApplication;
import com.beyon.practice.repository.CompanyOpportunityRepository;
import com.beyon.practice.repository.OpportunityApplicationRepository;
import com.beyon.profile.model.StudentProfile;
import com.beyon.profile.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.beyon.recruitment.model.RecruitmentApplication;
import com.beyon.recruitment.repository.RecruitmentApplicationRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service
public class CompanyService {

    private final CompanyOpportunityRepository opportunityRepository;
    private final OpportunityApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CoinService coinService;
    private final RecruitmentApplicationRepository recruitmentAppRepo;

    public CompanyService(CompanyOpportunityRepository opportunityRepository,
                          OpportunityApplicationRepository applicationRepository,
                          UserRepository userRepository,
                          StudentProfileRepository studentProfileRepository,
                          CoinService coinService,
                          RecruitmentApplicationRepository recruitmentAppRepo) {
        this.opportunityRepository = opportunityRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.coinService = coinService;
        this.recruitmentAppRepo = recruitmentAppRepo;
    }

    public List<CompanyOpportunity> getCompanyOpportunities(UUID companyUserId) {
        return opportunityRepository.findByCompanyUserIdOrderByCreatedAtDesc(companyUserId);
    }

    public List<CompanyOpportunity> getPublishedOpportunities() {
        return opportunityRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED");
    }

    public CompanyOpportunity getOpportunity(UUID id) {
        return opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found"));
    }

    @Transactional
    public CompanyOpportunity createOpportunity(UUID companyUserId, CompanyOpportunity opp) {
        opp.setCompanyUserId(companyUserId);
        return opportunityRepository.save(opp);
    }

    @Transactional
    public CompanyOpportunity updateOpportunity(UUID id, CompanyOpportunity update, UUID companyUserId) {
        CompanyOpportunity opp = getOpportunity(id);
        if (!opp.getCompanyUserId().equals(companyUserId)) {
            throw new ForbiddenException("Cannot modify another company's opportunity");
        }
        if (update.getTitle() != null) opp.setTitle(update.getTitle());
        if (update.getDescription() != null) opp.setDescription(update.getDescription());
        if (update.getStatus() != null) opp.setStatus(update.getStatus());
        if (update.getMinCgpa() != null) opp.setMinCgpa(update.getMinCgpa());
        if (update.getRequiredSkills() != null) opp.setRequiredSkills(update.getRequiredSkills());
        if (update.getMinBeyonCoins() > 0) opp.setMinBeyonCoins(update.getMinBeyonCoins());
        return opportunityRepository.save(opp);
    }

    public Map<String, Object> checkEligibility(UUID studentId, UUID opportunityId) {
        CompanyOpportunity opp = getOpportunity(opportunityId);
        StudentProfile profile = studentProfileRepository.findByUserId(studentId).orElse(null);
        User user = userRepository.findById(studentId).orElse(null);
        CoinWallet wallet = coinService.getOrCreateWallet(studentId);

        List<String> reasons = new ArrayList<>();
        boolean eligible = true;

        if (profile == null || user == null) {
            eligible = false;
            reasons.add("Profile not found");
        } else {
            if (opp.getMinCgpa() != null && profile.getCgpa() != null && profile.getCgpa().compareTo(opp.getMinCgpa()) < 0) {
                eligible = false;
                reasons.add("CGPA below minimum requirement");
            }
            if (opp.getEligibleDepartments() != null && !opp.getEligibleDepartments().isEmpty()) {
                List<String> depts = Arrays.asList(opp.getEligibleDepartments().split(","));
                if (profile.getDepartment() != null && depts.stream().noneMatch(d -> d.trim().equalsIgnoreCase(profile.getDepartment()))) {
                    eligible = false;
                    reasons.add("Department not eligible");
                }
            }
            if (opp.getEligibleGraduationYears() != null && !opp.getEligibleGraduationYears().isEmpty()) {
                List<String> years = Arrays.asList(opp.getEligibleGraduationYears().split(","));
                if (profile.getGraduationYear() != null && years.stream().noneMatch(y -> y.trim().equals(String.valueOf(profile.getGraduationYear())))) {
                    eligible = false;
                    reasons.add("Graduation year not eligible");
                }
            }
            if (opp.getMinBeyonCoins() > 0 && wallet.getBalance() < opp.getMinBeyonCoins()) {
                eligible = false;
                reasons.add("Insufficient Beyon Coins");
            }
            if (profile.getPlacementPreference() != null && profile.getPlacementPreference().name().equals("PLACEMENT_NOT_WILLING")) {
                eligible = false;
                reasons.add("Placement preference is set to Not Seeking");
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("eligible", eligible);
        result.put("reasons", reasons);
        result.put("coinBalance", wallet.getBalance());
        result.put("requiredCoins", opp.getMinBeyonCoins());
        return result;
    }

    @Transactional
    public OpportunityApplication applyToOpportunity(UUID studentId, UUID opportunityId) {
        if (applicationRepository.existsByOpportunityIdAndStudentId(opportunityId, studentId)) {
            throw new ConflictException("Already applied to this opportunity");
        }

        Map<String, Object> eligibility = checkEligibility(studentId, opportunityId);
        if (!(Boolean) eligibility.get("eligible")) {
            throw new ConflictException("Not eligible: " + String.join(", ", (List<String>) eligibility.get("reasons")));
        }

        CompanyOpportunity opp = getOpportunity(opportunityId);
        if (opp.getMinBeyonCoins() > 0) {
            coinService.spendCoins(studentId, "COMPANY_ASSESSMENT_APPLICATION", opp.getMinBeyonCoins(), "OPPORTUNITY", opportunityId);
        }

        OpportunityApplication app = new OpportunityApplication();
        app.setOpportunityId(opportunityId);
        app.setStudentId(studentId);
        app.setStatus("APPLIED");
        app.setCoinsSpent(opp.getMinBeyonCoins());
        app.setAppliedAt(Instant.now());

        opp.setApplicationCount(opp.getApplicationCount() + 1);
        opportunityRepository.save(opp);

        OpportunityApplication savedApp = applicationRepository.save(app);

        try {
            if (!recruitmentAppRepo.existsByOpportunityIdAndStudentId(opportunityId, studentId)) {
                RecruitmentApplication recApp = new RecruitmentApplication();
                recApp.setOpportunityId(opportunityId);
                recApp.setStudentId(studentId);
                recApp.setStatus("APPLIED");
                recApp.setCoinsSpent(opp.getMinBeyonCoins());
                recruitmentAppRepo.save(recApp);
            }
        } catch (Exception ignored) {}

        return savedApp;
    }

    public List<OpportunityApplication> getApplications(UUID studentId) {
        return applicationRepository.findByStudentIdOrderByUpdatedAtDesc(studentId);
    }

    public List<OpportunityApplication> getOpportunityApplications(UUID opportunityId) {
        return applicationRepository.findByOpportunityId(opportunityId);
    }
}
