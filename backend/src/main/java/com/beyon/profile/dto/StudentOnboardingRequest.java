package com.beyon.profile.dto;

import com.beyon.profile.enums.PlacementPreference;
import com.beyon.profile.enums.SkillProficiency;
import com.beyon.profile.enums.WorkType;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class StudentOnboardingRequest {

    @NotBlank(message = "Phone is required")
    @Size(max = 20)
    private String phone;

    private LocalDate dateOfBirth;
    private String gender;

    @NotBlank(message = "Country is required")
    private String country;
    private String state;
    private String city;

    @NotBlank(message = "Institution is required")
    private String institution;
    private String registrationNumber;
    private String degree;
    private String department;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    @DecimalMin(value = "0.00") @DecimalMax(value = "10.00")
    private BigDecimal cgpa;

    @NotNull(message = "Placement preference is required")
    private PlacementPreference placementPreference;

    private List<String> preferredJobRoles;
    private List<String> preferredIndustries;
    private WorkType preferredWorkType;

    @Size(max = 2000)
    private String aboutMe;

    private String profilePhotoUrl;
    private String resumeUrl;

    private List<SkillEntry> skills;
    private List<CertificationEntry> certifications;
    private List<ProjectEntry> projects;
    private List<LinkEntry> links;

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }
    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public BigDecimal getCgpa() { return cgpa; }
    public void setCgpa(BigDecimal cgpa) { this.cgpa = cgpa; }
    public PlacementPreference getPlacementPreference() { return placementPreference; }
    public void setPlacementPreference(PlacementPreference placementPreference) { this.placementPreference = placementPreference; }
    public List<String> getPreferredJobRoles() { return preferredJobRoles; }
    public void setPreferredJobRoles(List<String> preferredJobRoles) { this.preferredJobRoles = preferredJobRoles; }
    public List<String> getPreferredIndustries() { return preferredIndustries; }
    public void setPreferredIndustries(List<String> preferredIndustries) { this.preferredIndustries = preferredIndustries; }
    public WorkType getPreferredWorkType() { return preferredWorkType; }
    public void setPreferredWorkType(WorkType preferredWorkType) { this.preferredWorkType = preferredWorkType; }
    public String getAboutMe() { return aboutMe; }
    public void setAboutMe(String aboutMe) { this.aboutMe = aboutMe; }
    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public List<SkillEntry> getSkills() { return skills; }
    public void setSkills(List<SkillEntry> skills) { this.skills = skills; }
    public List<CertificationEntry> getCertifications() { return certifications; }
    public void setCertifications(List<CertificationEntry> certifications) { this.certifications = certifications; }
    public List<ProjectEntry> getProjects() { return projects; }
    public void setProjects(List<ProjectEntry> projects) { this.projects = projects; }
    public List<LinkEntry> getLinks() { return links; }
    public void setLinks(List<LinkEntry> links) { this.links = links; }

    public static class SkillEntry {
        @NotBlank private String skillName;
        private String category;
        @NotNull private SkillProficiency proficiency;
        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public SkillProficiency getProficiency() { return proficiency; }
        public void setProficiency(SkillProficiency proficiency) { this.proficiency = proficiency; }
    }

    public static class CertificationEntry {
        @NotBlank private String name;
        private String issuingOrg;
        private LocalDate issueDate;
        private LocalDate expiryDate;
        private String credentialId;
        private String credentialUrl;
        private String certificateUrl;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getIssuingOrg() { return issuingOrg; }
        public void setIssuingOrg(String issuingOrg) { this.issuingOrg = issuingOrg; }
        public LocalDate getIssueDate() { return issueDate; }
        public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
        public LocalDate getExpiryDate() { return expiryDate; }
        public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
        public String getCredentialId() { return credentialId; }
        public void setCredentialId(String credentialId) { this.credentialId = credentialId; }
        public String getCredentialUrl() { return credentialUrl; }
        public void setCredentialUrl(String credentialUrl) { this.credentialUrl = credentialUrl; }
        public String getCertificateUrl() { return certificateUrl; }
        public void setCertificateUrl(String certificateUrl) { this.certificateUrl = certificateUrl; }
    }

    public static class ProjectEntry {
        @NotBlank private String name;
        private String description;
        private String role;
        private String technologies;
        private String githubUrl;
        private String liveUrl;
        private String imageUrl;
        private LocalDate startDate;
        private LocalDate endDate;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getTechnologies() { return technologies; }
        public void setTechnologies(String technologies) { this.technologies = technologies; }
        public String getGithubUrl() { return githubUrl; }
        public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
        public String getLiveUrl() { return liveUrl; }
        public void setLiveUrl(String liveUrl) { this.liveUrl = liveUrl; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    }

    public static class LinkEntry {
        @NotBlank private String platform;
        @NotBlank private String url;
        public String getPlatform() { return platform; }
        public void setPlatform(String platform) { this.platform = platform; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }
}
