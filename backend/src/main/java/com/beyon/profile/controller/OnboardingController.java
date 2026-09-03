package com.beyon.profile.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.enums.AccountStatus;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.practice.service.CoinService;
import com.beyon.profile.enums.CertificationStatus;
import com.beyon.profile.enums.PlacementPreference;
import com.beyon.profile.enums.SkillProficiency;
import com.beyon.profile.enums.WorkType;
import com.beyon.profile.model.*;
import com.beyon.profile.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/onboarding")
public class OnboardingController {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final InstitutionProfileRepository institutionProfileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final StudentProjectRepository studentProjectRepository;
    private final StudentCertificationRepository studentCertificationRepository;
    private final StudentLinkRepository studentLinkRepository;
    private final CoinService coinService;

    public OnboardingController(UserRepository userRepository,
                                StudentProfileRepository studentProfileRepository,
                                CompanyProfileRepository companyProfileRepository,
                                InstitutionProfileRepository institutionProfileRepository,
                                StudentSkillRepository studentSkillRepository,
                                StudentProjectRepository studentProjectRepository,
                                StudentCertificationRepository studentCertificationRepository,
                                StudentLinkRepository studentLinkRepository,
                                CoinService coinService) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.institutionProfileRepository = institutionProfileRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.studentProjectRepository = studentProjectRepository;
        this.studentCertificationRepository = studentCertificationRepository;
        this.studentLinkRepository = studentLinkRepository;
        this.coinService = coinService;
    }

    @PostMapping("/student")
    public ResponseEntity<ApiResponse<Map<String, Object>>> completeStudentOnboarding(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        UUID userId = extractUserId(auth);

        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    StudentProfile sp = new StudentProfile();
                    sp.setUserId(userId);
                    return sp;
                });

        if (body.get("phone") != null) profile.setPhone(body.get("phone").toString());
        if (body.get("gender") != null) profile.setGender(body.get("gender").toString());
        if (body.get("country") != null) profile.setCountry(body.get("country").toString());
        if (body.get("state") != null) profile.setState(body.get("state").toString());
        if (body.get("city") != null) profile.setCity(body.get("city").toString());
        if (body.get("institution") != null) profile.setInstitution(body.get("institution").toString());
        if (body.get("registrationNumber") != null) profile.setRegistrationNumber(body.get("registrationNumber").toString());
        if (body.get("degree") != null) profile.setDegree(body.get("degree").toString());
        if (body.get("department") != null) profile.setDepartment(body.get("department").toString());
        if (body.get("academicYear") != null) profile.setAcademicYear(body.get("academicYear").toString());
        if (body.get("aboutMe") != null) profile.setAboutMe(body.get("aboutMe").toString());

        if (body.get("cgpa") != null && !body.get("cgpa").toString().isBlank()) {
            try {
                profile.setCgpa(new BigDecimal(body.get("cgpa").toString()));
            } catch (Exception ignored) {}
        }

        if (body.get("placementPreference") != null) {
            try {
                profile.setPlacementPreference(PlacementPreference.valueOf(body.get("placementPreference").toString()));
            } catch (Exception ignored) {}
        }

        if (body.get("preferredWorkType") != null) {
            try {
                profile.setPreferredWorkType(WorkType.valueOf(body.get("preferredWorkType").toString()));
            } catch (Exception ignored) {}
        }

        if (body.get("preferredJobRoles") instanceof List<?> roles) {
            profile.setPreferredJobRoles(String.join(",", roles.stream().map(Object::toString).toList()));
        }

        if (body.get("preferredIndustries") instanceof List<?> industries) {
            profile.setPreferredIndustries(String.join(",", industries.stream().map(Object::toString).toList()));
        }

        profile.setCompletionPct(100);
        studentProfileRepository.save(profile);

        // Process Skills
        if (body.get("skills") instanceof List<?> skillsList) {
            for (Object item : skillsList) {
                if (item instanceof Map<?, ?> smap && smap.get("skillName") != null) {
                    String sName = smap.get("skillName").toString();
                    if (!sName.isBlank()) {
                        StudentSkill sk = new StudentSkill();
                        sk.setUserId(userId);
                        sk.setSkillName(sName);
                        sk.setCategory(smap.get("category") != null ? smap.get("category").toString() : "Languages");
                        try {
                            if (smap.get("proficiency") != null) {
                                sk.setProficiency(SkillProficiency.valueOf(smap.get("proficiency").toString()));
                            }
                        } catch (Exception ignored) {}
                        studentSkillRepository.save(sk);
                    }
                }
            }
        }

        // Process Projects
        if (body.get("projects") instanceof List<?> projList) {
            for (Object item : projList) {
                if (item instanceof Map<?, ?> pmap && pmap.get("name") != null) {
                    String pName = pmap.get("name").toString();
                    if (!pName.isBlank()) {
                        StudentProject p = new StudentProject();
                        p.setUserId(userId);
                        p.setName(pName);
                        if (pmap.get("role") != null) p.setRole(pmap.get("role").toString());
                        if (pmap.get("description") != null) p.setDescription(pmap.get("description").toString());
                        if (pmap.get("technologies") != null) p.setTechnologies(pmap.get("technologies").toString());
                        if (pmap.get("githubUrl") != null) p.setGithubUrl(pmap.get("githubUrl").toString());
                        if (pmap.get("liveUrl") != null) p.setLiveUrl(pmap.get("liveUrl").toString());
                        studentProjectRepository.save(p);
                    }
                }
            }
        }

        // Process Certifications
        if (body.get("certifications") instanceof List<?> certList) {
            for (Object item : certList) {
                if (item instanceof Map<?, ?> cmap && cmap.get("name") != null) {
                    String cName = cmap.get("name").toString();
                    if (!cName.isBlank()) {
                        StudentCertification c = new StudentCertification();
                        c.setUserId(userId);
                        c.setName(cName);
                        if (cmap.get("issuingOrg") != null) c.setIssuingOrg(cmap.get("issuingOrg").toString());
                        if (cmap.get("credentialId") != null) c.setCredentialId(cmap.get("credentialId").toString());
                        if (cmap.get("credentialUrl") != null) c.setCredentialUrl(cmap.get("credentialUrl").toString());
                        c.setStatus(CertificationStatus.VERIFIED);
                        studentCertificationRepository.save(c);
                    }
                }
            }
        }

        // Process Links
        if (body.get("links") instanceof List<?> linkList) {
            for (Object item : linkList) {
                if (item instanceof Map<?, ?> lmap && lmap.get("platform") != null && lmap.get("url") != null) {
                    String url = lmap.get("url").toString();
                    if (!url.isBlank()) {
                        StudentLink l = new StudentLink();
                        l.setUserId(userId);
                        l.setPlatform(lmap.get("platform").toString());
                        l.setUrl(url);
                        studentLinkRepository.save(l);
                    }
                }
            }
        }

        // Mark user account active and profile completed
        userRepository.findById(userId).ifPresent(u -> {
            u.setProfileStatus(AccountStatus.COMPLETED);
            u.setStatus(AccountStatus.ACTIVE);
            userRepository.save(u);
        });

        // Award 100 Welcome Coins
        try {
            coinService.getOrCreateWallet(userId);
            coinService.earnCoins(userId, "ONBOARDING_COMPLETED", "ONBOARDING", userId);
        } catch (Exception ignored) {}

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "status", "COMPLETED",
                "message", "Student profile successfully activated",
                "coinsAwarded", 100
        )));
    }

    @PostMapping("/company")
    public ResponseEntity<ApiResponse<Map<String, Object>>> completeCompanyOnboarding(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        UUID userId = extractUserId(auth);

        CompanyProfile profile = companyProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CompanyProfile cp = new CompanyProfile();
                    cp.setUserId(userId);
                    return cp;
                });

        if (body.get("companyName") != null) profile.setCompanyName(body.get("companyName").toString());
        if (body.get("companyType") != null) profile.setCompanyType(body.get("companyType").toString());
        if (body.get("industry") != null) profile.setIndustry(body.get("industry").toString());
        if (body.get("website") != null) profile.setWebsite(body.get("website").toString());
        if (body.get("officialEmail") != null) profile.setOfficialEmail(body.get("officialEmail").toString());
        if (body.get("phone") != null) profile.setPhone(body.get("phone").toString());
        if (body.get("country") != null) profile.setCountry(body.get("country").toString());
        if (body.get("city") != null) profile.setCity(body.get("city").toString());
        if (body.get("headquarters") != null) profile.setHeadquarters(body.get("headquarters").toString());
        if (body.get("companySize") != null) profile.setCompanySize(body.get("companySize").toString());
        if (body.get("about") != null) profile.setAbout(body.get("about").toString());

        companyProfileRepository.save(profile);

        userRepository.findById(userId).ifPresent(u -> {
            u.setProfileStatus(AccountStatus.COMPLETED);
            u.setStatus(AccountStatus.ACTIVE);
            userRepository.save(u);
        });

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "status", "COMPLETED",
                "message", "Company profile successfully activated"
        )));
    }

    @PostMapping("/institution")
    public ResponseEntity<ApiResponse<Map<String, Object>>> completeInstitutionOnboarding(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        UUID userId = extractUserId(auth);

        InstitutionProfile profile = institutionProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    InstitutionProfile ip = new InstitutionProfile();
                    ip.setUserId(userId);
                    return ip;
                });

        if (body.get("institutionName") != null) profile.setInstitutionName(body.get("institutionName").toString());
        if (body.get("institutionType") != null) profile.setInstitutionType(body.get("institutionType").toString());
        if (body.get("institutionCode") != null) profile.setInstitutionCode(body.get("institutionCode").toString());
        if (body.get("officialEmail") != null) profile.setOfficialEmail(body.get("officialEmail").toString());
        if (body.get("phone") != null) profile.setPhone(body.get("phone").toString());
        if (body.get("website") != null) profile.setWebsite(body.get("website").toString());
        if (body.get("country") != null) profile.setCountry(body.get("country").toString());
        if (body.get("city") != null) profile.setCity(body.get("city").toString());
        if (body.get("address") != null) profile.setAddress(body.get("address").toString());

        institutionProfileRepository.save(profile);

        userRepository.findById(userId).ifPresent(u -> {
            u.setProfileStatus(AccountStatus.COMPLETED);
            u.setStatus(AccountStatus.ACTIVE);
            userRepository.save(u);
        });

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "status", "COMPLETED",
                "message", "Institution profile successfully activated"
        )));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
