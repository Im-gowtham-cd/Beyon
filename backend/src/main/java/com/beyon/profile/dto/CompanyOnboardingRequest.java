package com.beyon.profile.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public class CompanyOnboardingRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    private String logoUrl;
    private String companyType;

    @NotBlank(message = "Industry is required")
    private String industry;

    @NotBlank(message = "Website is required")
    private String website;

    @NotBlank(message = "Official email is required")
    @Email
    private String officialEmail;

    @NotBlank(message = "Phone is required")
    private String phone;

    private String country;
    private String state;
    private String city;
    private String headquarters;

    @NotBlank(message = "Company size is required")
    private String companySize;

    private Integer foundedYear;

    @NotBlank(message = "About is required")
    private String about;

    private String linkedin;
    private String verificationDocUrl;

    private List<String> hiringTypes;
    private List<String> preferredLevels;
    private List<String> recruitmentRegions;

    private List<String> skills;

    private List<RepresentativeEntry> representatives;

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getCompanyType() { return companyType; }
    public void setCompanyType(String companyType) { this.companyType = companyType; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getOfficialEmail() { return officialEmail; }
    public void setOfficialEmail(String officialEmail) { this.officialEmail = officialEmail; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getHeadquarters() { return headquarters; }
    public void setHeadquarters(String headquarters) { this.headquarters = headquarters; }
    public String getCompanySize() { return companySize; }
    public void setCompanySize(String companySize) { this.companySize = companySize; }
    public Integer getFoundedYear() { return foundedYear; }
    public void setFoundedYear(Integer foundedYear) { this.foundedYear = foundedYear; }
    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }
    public String getLinkedin() { return linkedin; }
    public void setLinkedin(String linkedin) { this.linkedin = linkedin; }
    public String getVerificationDocUrl() { return verificationDocUrl; }
    public void setVerificationDocUrl(String verificationDocUrl) { this.verificationDocUrl = verificationDocUrl; }
    public List<String> getHiringTypes() { return hiringTypes; }
    public void setHiringTypes(List<String> hiringTypes) { this.hiringTypes = hiringTypes; }
    public List<String> getPreferredLevels() { return preferredLevels; }
    public void setPreferredLevels(List<String> preferredLevels) { this.preferredLevels = preferredLevels; }
    public List<String> getRecruitmentRegions() { return recruitmentRegions; }
    public void setRecruitmentRegions(List<String> recruitmentRegions) { this.recruitmentRegions = recruitmentRegions; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public List<RepresentativeEntry> getRepresentatives() { return representatives; }
    public void setRepresentatives(List<RepresentativeEntry> representatives) { this.representatives = representatives; }

    public static class RepresentativeEntry {
        @NotBlank private String name;
        private String designation;
        private String email;
        private String phone;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDesignation() { return designation; }
        public void setDesignation(String designation) { this.designation = designation; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }
}
