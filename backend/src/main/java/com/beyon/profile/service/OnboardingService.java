package com.beyon.profile.service;

import com.beyon.common.exception.ConflictException;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.identity.enums.AccountStatus;
import com.beyon.identity.enums.UserRole;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.profile.dto.*;
import com.beyon.profile.model.*;
import com.beyon.profile.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class OnboardingService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final StudentCertificationRepository studentCertificationRepository;
    private final StudentProjectRepository studentProjectRepository;
    private final StudentLinkRepository studentLinkRepository;
    private final InstitutionProfileRepository institutionProfileRepository;
    private final InstitutionPlacementHistoryRepository institutionPlacementHistoryRepository;
    private final InstitutionRepresentativeRepository institutionRepresentativeRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final CompanyHiringPreferenceRepository companyHiringPreferenceRepository;
    private final CompanySkillRepository companySkillRepository;
    private final CompanyRepresentativeRepository companyRepresentativeRepository;

    public OnboardingService(UserRepository userRepository,
                              StudentProfileRepository studentProfileRepository,
                              StudentSkillRepository studentSkillRepository,
                              StudentCertificationRepository studentCertificationRepository,
                              StudentProjectRepository studentProjectRepository,
                              StudentLinkRepository studentLinkRepository,
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
        this.institutionProfileRepository = institutionProfileRepository;
        this.institutionPlacementHistoryRepository = institutionPlacementHistoryRepository;
        this.institutionRepresentativeRepository = institutionRepresentativeRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.companyHiringPreferenceRepository = companyHiringPreferenceRepository;
        this.companySkillRepository = companySkillRepository;
        this.companyRepresentativeRepository = companyRepresentativeRepository;
    }

    @Transactional
    public void createStudentProfile(UUID userId, StudentOnboardingRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != UserRole.STUDENT) {
            throw new ConflictException("User is not a student");
        }

        if (studentProfileRepository.existsByUserId(userId)) {
            throw new ConflictException("Student profile already exists");
        }

        StudentProfile profile = new StudentProfile();
        profile.setUserId(userId);
        profile.setPhone(req.getPhone());
        profile.setDateOfBirth(req.getDateOfBirth());
        profile.setGender(req.getGender());
        profile.setCountry(req.getCountry());
        profile.setState(req.getState());
        profile.setCity(req.getCity());
        profile.setInstitution(req.getInstitution());
        profile.setRegistrationNumber(req.getRegistrationNumber());
        profile.setDegree(req.getDegree());
        profile.setDepartment(req.getDepartment());
        profile.setAcademicYear(req.getAcademicYear());
        profile.setCgpa(req.getCgpa());
        profile.setPlacementPreference(req.getPlacementPreference());
        profile.setPreferredJobRoles(req.getPreferredJobRoles() != null ? String.join(",", req.getPreferredJobRoles()) : null);
        profile.setPreferredIndustries(req.getPreferredIndustries() != null ? String.join(",", req.getPreferredIndustries()) : null);
        profile.setPreferredWorkType(req.getPreferredWorkType());
        profile.setAboutMe(req.getAboutMe());
        profile.setProfilePhotoUrl(req.getProfilePhotoUrl());
        profile.setResumeUrl(req.getResumeUrl());
        profile.setCompletionPct(calculateStudentCompletion(req));
        studentProfileRepository.save(profile);

        user.setProfileStatus(AccountStatus.COMPLETED);
        userRepository.save(user);

        if (req.getSkills() != null) {
            for (StudentOnboardingRequest.SkillEntry s : req.getSkills()) {
                StudentSkill skill = new StudentSkill();
                skill.setUserId(userId);
                skill.setSkillName(s.getSkillName());
                skill.setCategory(s.getCategory());
                skill.setProficiency(s.getProficiency());
                studentSkillRepository.save(skill);
            }
        }

        if (req.getCertifications() != null) {
            for (StudentOnboardingRequest.CertificationEntry c : req.getCertifications()) {
                StudentCertification cert = new StudentCertification();
                cert.setUserId(userId);
                cert.setName(c.getName());
                cert.setIssuingOrg(c.getIssuingOrg());
                cert.setIssueDate(c.getIssueDate());
                cert.setExpiryDate(c.getExpiryDate());
                cert.setCredentialId(c.getCredentialId());
                cert.setCredentialUrl(c.getCredentialUrl());
                cert.setCertificateUrl(c.getCertificateUrl());
                studentCertificationRepository.save(cert);
            }
        }

        if (req.getProjects() != null) {
            for (StudentOnboardingRequest.ProjectEntry p : req.getProjects()) {
                StudentProject project = new StudentProject();
                project.setUserId(userId);
                project.setName(p.getName());
                project.setDescription(p.getDescription());
                project.setRole(p.getRole());
                project.setTechnologies(p.getTechnologies());
                project.setGithubUrl(p.getGithubUrl());
                project.setLiveUrl(p.getLiveUrl());
                project.setImageUrl(p.getImageUrl());
                project.setStartDate(p.getStartDate());
                project.setEndDate(p.getEndDate());
                studentProjectRepository.save(project);
            }
        }

        if (req.getLinks() != null) {
            for (StudentOnboardingRequest.LinkEntry l : req.getLinks()) {
                StudentLink link = new StudentLink();
                link.setUserId(userId);
                link.setPlatform(l.getPlatform());
                link.setUrl(l.getUrl());
                studentLinkRepository.save(link);
            }
        }
    }

    @Transactional
    public void createInstitutionProfile(UUID userId, InstitutionOnboardingRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != UserRole.INSTITUTION) {
            throw new ConflictException("User is not an institution");
        }

        if (institutionProfileRepository.existsByUserId(userId)) {
            throw new ConflictException("Institution profile already exists");
        }

        InstitutionProfile profile = new InstitutionProfile();
        profile.setUserId(userId);
        profile.setInstitutionName(req.getInstitutionName());
        profile.setInstitutionType(req.getInstitutionType());
        profile.setInstitutionCode(req.getInstitutionCode());
        profile.setOfficialEmail(req.getOfficialEmail());
        profile.setPhone(req.getPhone());
        profile.setWebsite(req.getWebsite());
        profile.setCountry(req.getCountry());
        profile.setState(req.getState());
        profile.setCity(req.getCity());
        profile.setAddress(req.getAddress());
        profile.setPostalCode(req.getPostalCode());
        profile.setAffiliatedUniversity(req.getAffiliatedUniversity());
        profile.setAccreditations(req.getAccreditations() != null ? String.join(",", req.getAccreditations()) : null);
        profile.setAccreditationGrade(req.getAccreditationGrade());
        profile.setEstablishedYear(req.getEstablishedYear());
        profile.setPlacementRate(req.getPlacementRate());
        profile.setAveragePackage(req.getAveragePackage());
        profile.setHighestPackage(req.getHighestPackage());
        profile.setTotalStudents(req.getTotalStudents());
        profile.setPlacementWillingCount(req.getPlacementWillingCount());
        profile.setPlacementNotWillingCount(req.getPlacementNotWillingCount());
        profile.setVerificationDocUrl(req.getVerificationDocUrl());
        profile.setLogoUrl(req.getLogoUrl());
        profile.setCompletionPct(calculateInstitutionCompletion(req));
        institutionProfileRepository.save(profile);

        user.setProfileStatus(AccountStatus.PENDING_INSTITUTION_VERIFICATION);
        userRepository.save(user);

        if (req.getPlacementHistory() != null) {
            for (InstitutionOnboardingRequest.PlacementHistoryEntry h : req.getPlacementHistory()) {
                InstitutionPlacementHistory history = new InstitutionPlacementHistory();
                history.setUserId(userId);
                history.setAcademicYear(h.getAcademicYear());
                history.setStudentsPlaced(h.getStudentsPlaced());
                history.setPlacementPercentage(h.getPlacementPercentage());
                history.setAveragePackage(h.getAveragePackage());
                history.setHighestPackage(h.getHighestPackage());
                institutionPlacementHistoryRepository.save(history);
            }
        }

        if (req.getRepresentatives() != null) {
            for (InstitutionOnboardingRequest.RepresentativeEntry r : req.getRepresentatives()) {
                InstitutionRepresentative rep = new InstitutionRepresentative();
                rep.setUserId(userId);
                rep.setName(r.getName());
                rep.setDesignation(r.getDesignation());
                rep.setEmail(r.getEmail());
                rep.setPhone(r.getPhone());
                rep.setDepartment(r.getDepartment());
                institutionRepresentativeRepository.save(rep);
            }
        }
    }

    @Transactional
    public void createCompanyProfile(UUID userId, CompanyOnboardingRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != UserRole.COMPANY) {
            throw new ConflictException("User is not a company");
        }

        if (companyProfileRepository.existsByUserId(userId)) {
            throw new ConflictException("Company profile already exists");
        }

        CompanyProfile profile = new CompanyProfile();
        profile.setUserId(userId);
        profile.setCompanyName(req.getCompanyName());
        profile.setLogoUrl(req.getLogoUrl());
        profile.setCompanyType(req.getCompanyType());
        profile.setIndustry(req.getIndustry());
        profile.setWebsite(req.getWebsite());
        profile.setOfficialEmail(req.getOfficialEmail());
        profile.setPhone(req.getPhone());
        profile.setCountry(req.getCountry());
        profile.setState(req.getState());
        profile.setCity(req.getCity());
        profile.setHeadquarters(req.getHeadquarters());
        profile.setCompanySize(req.getCompanySize());
        profile.setFoundedYear(req.getFoundedYear());
        profile.setAbout(req.getAbout());
        profile.setLinkedin(req.getLinkedin());
        profile.setVerificationDocUrl(req.getVerificationDocUrl());
        profile.setCompletionPct(calculateCompanyCompletion(req));
        companyProfileRepository.save(profile);

        user.setProfileStatus(AccountStatus.PENDING_COMPANY_VERIFICATION);
        userRepository.save(user);

        if (req.getHiringTypes() != null || req.getPreferredLevels() != null || req.getRecruitmentRegions() != null) {
            CompanyHiringPreference prefs = new CompanyHiringPreference();
            prefs.setUserId(userId);
            prefs.setHiringTypes(req.getHiringTypes() != null ? String.join(",", req.getHiringTypes()) : null);
            prefs.setPreferredLevels(req.getPreferredLevels() != null ? String.join(",", req.getPreferredLevels()) : null);
            prefs.setRecruitmentRegions(req.getRecruitmentRegions() != null ? String.join(",", req.getRecruitmentRegions()) : null);
            companyHiringPreferenceRepository.save(prefs);
        }

        if (req.getSkills() != null) {
            for (String skillName : req.getSkills()) {
                CompanySkill skill = new CompanySkill();
                skill.setUserId(userId);
                skill.setSkillName(skillName);
                companySkillRepository.save(skill);
            }
        }

        if (req.getRepresentatives() != null) {
            for (CompanyOnboardingRequest.RepresentativeEntry r : req.getRepresentatives()) {
                CompanyRepresentative rep = new CompanyRepresentative();
                rep.setUserId(userId);
                rep.setName(r.getName());
                rep.setDesignation(r.getDesignation());
                rep.setEmail(r.getEmail());
                rep.setPhone(r.getPhone());
                companyRepresentativeRepository.save(rep);
            }
        }
    }

    private int calculateStudentCompletion(StudentOnboardingRequest req) {
        int filled = 0;
        int total = 8;
        if (req.getPhone() != null) filled++;
        if (req.getInstitution() != null) filled++;
        if (req.getDepartment() != null) filled++;
        if (req.getAcademicYear() != null) filled++;
        if (req.getPlacementPreference() != null) filled++;
        if (req.getSkills() != null && !req.getSkills().isEmpty()) filled++;
        if (req.getPreferredJobRoles() != null && !req.getPreferredJobRoles().isEmpty()) filled++;
        if (req.getAboutMe() != null && !req.getAboutMe().isBlank()) filled++;
        return (filled * 100) / total;
    }

    private int calculateInstitutionCompletion(InstitutionOnboardingRequest req) {
        int filled = 0;
        int total = 6;
        if (req.getInstitutionName() != null) filled++;
        if (req.getOfficialEmail() != null) filled++;
        if (req.getPhone() != null) filled++;
        if (req.getCountry() != null) filled++;
        if (req.getRepresentatives() != null && !req.getRepresentatives().isEmpty()) filled++;
        if (req.getAccreditations() != null && !req.getAccreditations().isEmpty()) filled++;
        return (filled * 100) / total;
    }

    private int calculateCompanyCompletion(CompanyOnboardingRequest req) {
        int filled = 0;
        int total = 7;
        if (req.getCompanyName() != null) filled++;
        if (req.getIndustry() != null) filled++;
        if (req.getWebsite() != null) filled++;
        if (req.getOfficialEmail() != null) filled++;
        if (req.getAbout() != null && !req.getAbout().isBlank()) filled++;
        if (req.getSkills() != null && !req.getSkills().isEmpty()) filled++;
        if (req.getRepresentatives() != null && !req.getRepresentatives().isEmpty()) filled++;
        return (filled * 100) / total;
    }
}
