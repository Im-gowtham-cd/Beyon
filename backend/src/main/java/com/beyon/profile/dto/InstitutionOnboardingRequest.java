package com.beyon.profile.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public class InstitutionOnboardingRequest {

    @NotBlank(message = "Institution name is required")
    private String institutionName;

    private String institutionType;
    private String institutionCode;

    @NotBlank(message = "Official email is required")
    @Email
    private String officialEmail;

    @NotBlank(message = "Phone is required")
    private String phone;

    private String website;
    private String country;
    private String state;
    private String city;
    private String address;
    private String postalCode;

    private String affiliatedUniversity;
    private List<String> accreditations;
    private String accreditationGrade;
    private Integer establishedYear;

    private BigDecimal placementRate;
    private BigDecimal averagePackage;
    private BigDecimal highestPackage;
    private Integer totalStudents;
    private Integer placementWillingCount;
    private Integer placementNotWillingCount;

    private String verificationDocUrl;
    private String logoUrl;

    private List<PlacementHistoryEntry> placementHistory;
    private List<RepresentativeEntry> representatives;

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }
    public String getInstitutionType() { return institutionType; }
    public void setInstitutionType(String institutionType) { this.institutionType = institutionType; }
    public String getInstitutionCode() { return institutionCode; }
    public void setInstitutionCode(String institutionCode) { this.institutionCode = institutionCode; }
    public String getOfficialEmail() { return officialEmail; }
    public void setOfficialEmail(String officialEmail) { this.officialEmail = officialEmail; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public String getAffiliatedUniversity() { return affiliatedUniversity; }
    public void setAffiliatedUniversity(String affiliatedUniversity) { this.affiliatedUniversity = affiliatedUniversity; }
    public List<String> getAccreditations() { return accreditations; }
    public void setAccreditations(List<String> accreditations) { this.accreditations = accreditations; }
    public String getAccreditationGrade() { return accreditationGrade; }
    public void setAccreditationGrade(String accreditationGrade) { this.accreditationGrade = accreditationGrade; }
    public Integer getEstablishedYear() { return establishedYear; }
    public void setEstablishedYear(Integer establishedYear) { this.establishedYear = establishedYear; }
    public BigDecimal getPlacementRate() { return placementRate; }
    public void setPlacementRate(BigDecimal placementRate) { this.placementRate = placementRate; }
    public BigDecimal getAveragePackage() { return averagePackage; }
    public void setAveragePackage(BigDecimal averagePackage) { this.averagePackage = averagePackage; }
    public BigDecimal getHighestPackage() { return highestPackage; }
    public void setHighestPackage(BigDecimal highestPackage) { this.highestPackage = highestPackage; }
    public Integer getTotalStudents() { return totalStudents; }
    public void setTotalStudents(Integer totalStudents) { this.totalStudents = totalStudents; }
    public Integer getPlacementWillingCount() { return placementWillingCount; }
    public void setPlacementWillingCount(Integer placementWillingCount) { this.placementWillingCount = placementWillingCount; }
    public Integer getPlacementNotWillingCount() { return placementNotWillingCount; }
    public void setPlacementNotWillingCount(Integer placementNotWillingCount) { this.placementNotWillingCount = placementNotWillingCount; }
    public String getVerificationDocUrl() { return verificationDocUrl; }
    public void setVerificationDocUrl(String verificationDocUrl) { this.verificationDocUrl = verificationDocUrl; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public List<PlacementHistoryEntry> getPlacementHistory() { return placementHistory; }
    public void setPlacementHistory(List<PlacementHistoryEntry> placementHistory) { this.placementHistory = placementHistory; }
    public List<RepresentativeEntry> getRepresentatives() { return representatives; }
    public void setRepresentatives(List<RepresentativeEntry> representatives) { this.representatives = representatives; }

    public static class PlacementHistoryEntry {
        @NotBlank private String academicYear;
        private Integer studentsPlaced;
        private BigDecimal placementPercentage;
        private BigDecimal averagePackage;
        private BigDecimal highestPackage;
        public String getAcademicYear() { return academicYear; }
        public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
        public Integer getStudentsPlaced() { return studentsPlaced; }
        public void setStudentsPlaced(Integer studentsPlaced) { this.studentsPlaced = studentsPlaced; }
        public BigDecimal getPlacementPercentage() { return placementPercentage; }
        public void setPlacementPercentage(BigDecimal placementPercentage) { this.placementPercentage = placementPercentage; }
        public BigDecimal getAveragePackage() { return averagePackage; }
        public void setAveragePackage(BigDecimal averagePackage) { this.averagePackage = averagePackage; }
        public BigDecimal getHighestPackage() { return highestPackage; }
        public void setHighestPackage(BigDecimal highestPackage) { this.highestPackage = highestPackage; }
    }

    public static class RepresentativeEntry {
        @NotBlank private String name;
        private String designation;
        private String email;
        private String phone;
        private String department;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDesignation() { return designation; }
        public void setDesignation(String designation) { this.designation = designation; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
    }
}
