package com.beyon.profile.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "institution_profiles")
public class InstitutionProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID userId;

    @Column(nullable = false, length = 200)
    private String institutionName;

    @Column(length = 50)
    private String institutionType;

    @Column(length = 50)
    private String institutionCode;

    @Column(length = 255)
    private String officialEmail;

    @Column(length = 20)
    private String phone;

    @Column(length = 500)
    private String website;

    @Column(length = 100)
    private String country;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    private String city;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 20)
    private String postalCode;

    @Column(length = 200)
    private String affiliatedUniversity;

    @Column(columnDefinition = "TEXT")
    private String accreditations;

    @Column(length = 50)
    private String accreditationGrade;

    private Integer establishedYear;

    @Column(precision = 5, scale = 2)
    private BigDecimal placementRate;

    @Column(precision = 12, scale = 2)
    private BigDecimal averagePackage;

    @Column(precision = 12, scale = 2)
    private BigDecimal highestPackage;

    private Integer totalStudents;

    private Integer placementWillingCount;

    private Integer placementNotWillingCount;

    @Column(length = 500)
    private String verificationDocUrl;

    @Column(length = 500)
    private String logoUrl;

    @Column(nullable = false)
    private int completionPct = 0;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
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
    public String getAccreditations() { return accreditations; }
    public void setAccreditations(String accreditations) { this.accreditations = accreditations; }
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
    public int getCompletionPct() { return completionPct; }
    public void setCompletionPct(int completionPct) { this.completionPct = completionPct; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
