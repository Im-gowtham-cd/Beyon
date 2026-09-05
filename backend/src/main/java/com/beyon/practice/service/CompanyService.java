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

    private final com.beyon.profile.repository.InstitutionProfileRepository institutionProfileRepository;
    private final com.beyon.institution.repository.PlacementDriveRepository placementDriveRepository;
    private final com.beyon.practice.repository.QuestionRepository questionRepository;
    private final com.beyon.practice.repository.QuestionOptionRepository questionOptionRepository;
    private final com.beyon.assessment.repository.AssessmentConfigurationRepository assessmentConfigRepository;

    public CompanyService(CompanyOpportunityRepository opportunityRepository,
                          OpportunityApplicationRepository applicationRepository,
                          UserRepository userRepository,
                          StudentProfileRepository studentProfileRepository,
                          CoinService coinService,
                          RecruitmentApplicationRepository recruitmentAppRepo,
                          com.beyon.profile.repository.InstitutionProfileRepository institutionProfileRepository,
                          com.beyon.institution.repository.PlacementDriveRepository placementDriveRepository,
                          com.beyon.practice.repository.QuestionRepository questionRepository,
                          com.beyon.practice.repository.QuestionOptionRepository questionOptionRepository,
                          com.beyon.assessment.repository.AssessmentConfigurationRepository assessmentConfigRepository) {
        this.opportunityRepository = opportunityRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.coinService = coinService;
        this.recruitmentAppRepo = recruitmentAppRepo;
        this.institutionProfileRepository = institutionProfileRepository;
        this.placementDriveRepository = placementDriveRepository;
        this.questionRepository = questionRepository;
        this.questionOptionRepository = questionOptionRepository;
        this.assessmentConfigRepository = assessmentConfigRepository;
    }

    public List<Map<String, Object>> getActiveInstitutions() {
        List<User> activeUsers = userRepository.findByRoleAndStatus(
                com.beyon.identity.enums.UserRole.INSTITUTION,
                com.beyon.identity.enums.AccountStatus.ACTIVE
        );
        List<com.beyon.profile.model.StudentProfile> allStudentProfiles = studentProfileRepository.findAll();

        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : activeUsers) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getDisplayName());
            map.put("email", u.getEmail());
            institutionProfileRepository.findByUserId(u.getId()).ifPresent(prof -> {
                if (prof.getInstitutionName() != null && !prof.getInstitutionName().isBlank()) {
                    map.put("name", prof.getInstitutionName());
                }
                map.put("code", prof.getInstitutionCode());
                map.put("city", prof.getCity());
                map.put("state", prof.getState());
                map.put("grade", prof.getAccreditationGrade());
                map.put("type", prof.getInstitutionType());
            });

            String instName = (String) map.get("name");
            Set<String> depts = new LinkedHashSet<>();

            // Find departments from registered students in this institution
            for (com.beyon.profile.model.StudentProfile sp : allStudentProfiles) {
                if (sp.getDepartment() != null && !sp.getDepartment().isBlank()) {
                    if (instName != null && sp.getInstitution() != null &&
                        (sp.getInstitution().equalsIgnoreCase(instName) || instName.toLowerCase().contains(sp.getInstitution().toLowerCase()))) {
                        depts.add(sp.getDepartment().trim());
                    }
                }
            }

            // Always provide the standard academic engineering departments
            depts.add("Computer Science and Engineering");
            depts.add("Information Technology");
            depts.add("Artificial Intelligence & Data Science");
            depts.add("Electronics and Communication Engineering");
            depts.add("Electrical and Electronics Engineering");
            depts.add("Mechanical Engineering");
            depts.add("Civil Engineering");
            depts.add("Cybersecurity & Digital Forensics");

            map.put("departments", new ArrayList<>(depts));
            result.add(map);
        }
        return result;
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
        CompanyOpportunity saved = opportunityRepository.save(opp);

        if ("CAMPUS_DRIVE".equalsIgnoreCase(saved.getOpportunityType()) &&
            saved.getTargetInstitutionIds() != null &&
            !saved.getTargetInstitutionIds().isBlank()) {
            
            String[] instIds = saved.getTargetInstitutionIds().split(",");
            for (String idStr : instIds) {
                String clean = idStr.trim();
                if (!clean.isEmpty()) {
                    try {
                        UUID instId = UUID.fromString(clean);
                        com.beyon.institution.model.PlacementDrive pd = new com.beyon.institution.model.PlacementDrive();
                        pd.setOpportunityId(saved.getId());
                        pd.setInstitutionId(instId);
                        pd.setCompanyUserId(companyUserId);
                        pd.setTitle(saved.getTitle());
                        pd.setDescription(saved.getDescription());
                        pd.setStatus("PENDING_APPROVAL");
                        placementDriveRepository.save(pd);
                    } catch (Exception ignored) {}
                }
            }
        }

        return saved;
    }

    @Transactional
    public CompanyOpportunity createOpportunityWithQuestions(UUID companyUserId, Map<String, Object> payload) {
        CompanyOpportunity opp = new CompanyOpportunity();
        opp.setCompanyUserId(companyUserId);
        opp.setTitle((String) payload.get("title"));
        opp.setDescription((String) payload.get("description"));
        opp.setOpportunityType(payload.get("opportunityType") != null ? (String) payload.get("opportunityType") : "CAMPUS_DRIVE");
        opp.setLocation((String) payload.get("location"));
        opp.setRemote(Boolean.TRUE.equals(payload.get("remote")));
        if (payload.get("minCgpa") != null) {
            try {
                opp.setMinCgpa(new BigDecimal(payload.get("minCgpa").toString()));
            } catch (Exception ignored) {}
        }
        opp.setEligibleDepartments((String) payload.get("eligibleDepartments"));
        opp.setEligibleGraduationYears((String) payload.get("eligibleGraduationYears"));
        opp.setRequiredSkills((String) payload.get("requiredSkills"));
        opp.setPreferredSkills((String) payload.get("preferredSkills"));
        if (payload.get("minBeyonCoins") != null) {
            try {
                opp.setMinBeyonCoins(((Number) payload.get("minBeyonCoins")).intValue());
            } catch (Exception ignored) {}
        }
        opp.setTargetInstitutionIds((String) payload.get("targetInstitutionIds"));
        opp.setTargetInstitutionNames((String) payload.get("targetInstitutionNames"));
        opp.setStatus(payload.get("status") != null ? (String) payload.get("status") : "PUBLISHED");

        // 1. Create and link AssessmentConfiguration for this drive
        int durationMins = payload.get("durationMinutes") != null ? ((Number) payload.get("durationMinutes")).intValue() : 60;
        int passingScore = payload.get("passingScore") != null ? ((Number) payload.get("passingScore")).intValue() : 65;
        
        List<Map<String, Object>> questionsData = (List<Map<String, Object>>) payload.get("questions");
        int totalQuestions = (questionsData != null && !questionsData.isEmpty()) ? questionsData.size() : (payload.get("totalQuestions") != null ? ((Number) payload.get("totalQuestions")).intValue() : 20);

        com.beyon.assessment.model.AssessmentConfiguration assessmentConfig = new com.beyon.assessment.model.AssessmentConfiguration();
        assessmentConfig.setCompanyId(companyUserId);
        assessmentConfig.setTitle(opp.getTitle() + " Assessment");
        assessmentConfig.setDescription("Official Proctored Assessment for " + opp.getTitle());
        assessmentConfig.setDurationMinutes(durationMins);
        assessmentConfig.setTotalQuestions(totalQuestions);
        assessmentConfig.setPassingScore(new BigDecimal(passingScore));
        assessmentConfig.setStatus("PUBLISHED");
        assessmentConfig.setAdaptiveEnabled(Boolean.TRUE.equals(payload.get("adaptiveEnabled")));
        com.beyon.assessment.model.AssessmentConfiguration savedConfig = assessmentConfigRepository.save(assessmentConfig);
        opp.setAssessmentId(savedConfig.getId());

        CompanyOpportunity savedOpp = opportunityRepository.save(opp);

        // 2. Save custom questions and options created by company
        if (questionsData != null && !questionsData.isEmpty()) {
            for (int i = 0; i < questionsData.size(); i++) {
                Map<String, Object> qMap = questionsData.get(i);
                com.beyon.practice.model.Question q = new com.beyon.practice.model.Question();
                String qTitle = qMap.get("title") != null ? (String) qMap.get("title") : "Question " + (i + 1);
                q.setTitle(qTitle);
                q.setDescription(qMap.get("description") != null ? (String) qMap.get("description") : qTitle);
                q.setQuestionType(qMap.get("questionType") != null ? (String) qMap.get("questionType") : "MCQ_SINGLE");
                q.setDifficulty(qMap.get("difficulty") != null ? (String) qMap.get("difficulty") : "MEDIUM");
                q.setExplanation((String) qMap.get("explanation"));
                q.setCreatedBy(companyUserId);
                q.setStatus("PUBLISHED");
                q.setTags("opportunity:" + savedOpp.getId() + ",assessment:" + savedConfig.getId());
                com.beyon.practice.model.Question savedQ = questionRepository.save(q);

                List<Map<String, Object>> optionsData = (List<Map<String, Object>>) qMap.get("options");
                if (optionsData != null) {
                    for (int optIdx = 0; optIdx < optionsData.size(); optIdx++) {
                        Map<String, Object> optMap = optionsData.get(optIdx);
                        com.beyon.practice.model.QuestionOption opt = new com.beyon.practice.model.QuestionOption();
                        opt.setQuestionId(savedQ.getId());
                        opt.setOptionText((String) optMap.get("optionText"));
                        opt.setCorrect(Boolean.TRUE.equals(optMap.get("isCorrect")) || Boolean.TRUE.equals(optMap.get("correct")));
                        opt.setDisplayOrder(optIdx + 1);
                        opt.setExplanation((String) optMap.get("explanation"));
                        questionOptionRepository.save(opt);
                    }
                }
            }
        }

        // 3. Register placement drives for target institutions
        if ("CAMPUS_DRIVE".equalsIgnoreCase(savedOpp.getOpportunityType()) &&
            savedOpp.getTargetInstitutionIds() != null &&
            !savedOpp.getTargetInstitutionIds().isBlank()) {
            
            String[] instIds = savedOpp.getTargetInstitutionIds().split(",");
            for (String idStr : instIds) {
                String clean = idStr.trim();
                if (!clean.isEmpty()) {
                    try {
                        UUID instId = UUID.fromString(clean);
                        com.beyon.institution.model.PlacementDrive pd = new com.beyon.institution.model.PlacementDrive();
                        pd.setOpportunityId(savedOpp.getId());
                        pd.setInstitutionId(instId);
                        pd.setCompanyUserId(companyUserId);
                        pd.setTitle(savedOpp.getTitle());
                        pd.setDescription(savedOpp.getDescription());
                        pd.setStatus("PENDING_APPROVAL");
                        placementDriveRepository.save(pd);
                    } catch (Exception ignored) {}
                }
            }
        }

        return savedOpp;
    }

    public List<Map<String, Object>> getOpportunityQuestions(UUID opportunityId) {
        String tag = "opportunity:" + opportunityId;
        List<com.beyon.practice.model.Question> questions = questionRepository.findByTagsContainingOrderByCreatedAtAsc(tag);
        
        if (questions.isEmpty()) {
            questions = questionRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED", org.springframework.data.domain.PageRequest.of(0, 20));
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (com.beyon.practice.model.Question q : questions) {
            Map<String, Object> qMap = new LinkedHashMap<>();
            qMap.put("id", q.getId());
            qMap.put("title", q.getTitle());
            qMap.put("description", q.getDescription());
            qMap.put("questionType", q.getQuestionType());
            qMap.put("difficulty", q.getDifficulty());
            qMap.put("explanation", q.getExplanation());

            List<com.beyon.practice.model.QuestionOption> options = questionOptionRepository.findByQuestionIdOrderByDisplayOrder(q.getId());
            List<Map<String, Object>> optList = new ArrayList<>();
            for (com.beyon.practice.model.QuestionOption opt : options) {
                Map<String, Object> optMap = new LinkedHashMap<>();
                optMap.put("id", opt.getId());
                optMap.put("optionText", opt.getOptionText());
                optMap.put("displayOrder", opt.getDisplayOrder());
                optList.add(optMap);
            }
            qMap.put("options", optList);
            result.add(qMap);
        }
        return result;
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
            List<com.beyon.institution.model.PlacementDrive> matchingDrives = placementDriveRepository.findByOpportunityId(opportunityId);
            com.beyon.institution.model.PlacementDrive matchedDrive = matchingDrives.isEmpty() ? null : matchingDrives.get(0);

            if (!recruitmentAppRepo.existsByOpportunityIdAndStudentId(opportunityId, studentId)) {
                RecruitmentApplication recApp = new RecruitmentApplication();
                recApp.setOpportunityId(opportunityId);
                recApp.setStudentId(studentId);
                recApp.setStatus("APPLIED");
                recApp.setCoinsSpent(opp.getMinBeyonCoins());
                recApp.setAppliedAt(Instant.now());
                if (matchedDrive != null) {
                    recApp.setDriveId(matchedDrive.getId());
                    recApp.setInstitutionId(matchedDrive.getInstitutionId());
                }
                recruitmentAppRepo.save(recApp);
            }

            if (matchedDrive != null) {
                matchedDrive.setAppliedCount(matchedDrive.getAppliedCount() + 1);
                matchedDrive.setApplicantCount(matchedDrive.getAppliedCount());
                placementDriveRepository.save(matchedDrive);
            }
        } catch (Exception ignored) {}

        return savedApp;
    }

    public List<OpportunityApplication> getApplications(UUID studentId) {
        return applicationRepository.findByStudentIdOrderByUpdatedAtDesc(studentId);
    }

    public List<Map<String, Object>> getOptedInOpportunities(UUID studentId) {
        List<OpportunityApplication> apps = applicationRepository.findByStudentIdOrderByUpdatedAtDesc(studentId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (OpportunityApplication app : apps) {
            opportunityRepository.findById(app.getOpportunityId()).ifPresent(opp -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", opp.getId());
                map.put("applicationId", app.getId());
                map.put("title", opp.getTitle());
                String companyName = "Beyon Partner";
                if (opp.getCompanyUserId() != null) {
                    var companyUser = userRepository.findById(opp.getCompanyUserId()).orElse(null);
                    if (companyUser != null && companyUser.getDisplayName() != null) {
                        companyName = companyUser.getDisplayName();
                    }
                }
                map.put("companyName", companyName);
                map.put("role", opp.getTitle());
                map.put("opportunityType", opp.getOpportunityType());
                map.put("location", opp.getLocation());
                map.put("eligibleDepartments", opp.getEligibleDepartments());
                map.put("requiredSkills", opp.getRequiredSkills());
                map.put("minCgpa", opp.getMinCgpa());
                map.put("durationMinutes", 60);
                map.put("totalQuestions", 20);
                map.put("applicationStatus", app.getStatus());
                map.put("assessmentScore", app.getAssessmentScore());
                map.put("appliedAt", app.getAppliedAt());
                map.put("status", opp.getStatus());
                result.add(map);
            });
        }
        return result;
    }

    public List<OpportunityApplication> getOpportunityApplications(UUID opportunityId) {
        return applicationRepository.findByOpportunityId(opportunityId);
    }
}
