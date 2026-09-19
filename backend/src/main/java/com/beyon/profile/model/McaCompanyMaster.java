package com.beyon.profile.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "mca_company_master")
public class McaCompanyMaster {

    @Id
    @Column(columnDefinition = "varchar(36)")
    private String id;

    @Column(nullable = false, unique = true, length = 21)
    private String cin;

    @Column(nullable = false, length = 500)
    private String companyName;

    @Column(length = 50)
    private String companyRegistrationDate;

    @Column(length = 100)
    private String companyCategory;

    @Column(length = 50)
    private String companyClass;

    @Column(length = 50)
    private String listingStatus;

    @Column(precision = 18, scale = 2)
    private BigDecimal authorizedCapital;

    @Column(precision = 18, scale = 2)
    private BigDecimal paidupCapital;

    @Column(length = 100)
    private String companyRoc;

    @Column(columnDefinition = "TEXT")
    private String companyAddress;

    @Column(length = 20)
    private String pinCode;

    @Column(length = 100)
    private String companyState;

    @Column(nullable = false, length = 50)
    private String companyStatus;

    @Column(length = 100)
    private String companySubCategory;

    @Column(length = 255)
    private String companyIndustrialClassification;

    @Column(length = 500)
    private String officialWebsite;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public McaCompanyMaster() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getCompanyRegistrationDate() { return companyRegistrationDate; }
    public void setCompanyRegistrationDate(String companyRegistrationDate) { this.companyRegistrationDate = companyRegistrationDate; }
    public String getCompanyCategory() { return companyCategory; }
    public void setCompanyCategory(String companyCategory) { this.companyCategory = companyCategory; }
    public String getCompanyClass() { return companyClass; }
    public void setCompanyClass(String companyClass) { this.companyClass = companyClass; }
    public String getListingStatus() { return listingStatus; }
    public void setListingStatus(String listingStatus) { this.listingStatus = listingStatus; }
    public BigDecimal getAuthorizedCapital() { return authorizedCapital; }
    public void setAuthorizedCapital(BigDecimal authorizedCapital) { this.authorizedCapital = authorizedCapital; }
    public BigDecimal getPaidupCapital() { return paidupCapital; }
    public void setPaidupCapital(BigDecimal paidupCapital) { this.paidupCapital = paidupCapital; }
    public String getCompanyRoc() { return companyRoc; }
    public void setCompanyRoc(String companyRoc) { this.companyRoc = companyRoc; }
    public String getCompanyAddress() { return companyAddress; }
    public void setCompanyAddress(String companyAddress) { this.companyAddress = companyAddress; }
    public String getPinCode() { return pinCode; }
    public void setPinCode(String pinCode) { this.pinCode = pinCode; }
    public String getCompanyState() { return companyState; }
    public void setCompanyState(String companyState) { this.companyState = companyState; }
    public String getCompanyStatus() { return companyStatus; }
    public void setCompanyStatus(String companyStatus) { this.companyStatus = companyStatus; }
    public String getCompanySubCategory() { return companySubCategory; }
    public void setCompanySubCategory(String companySubCategory) { this.companySubCategory = companySubCategory; }
    public String getCompanyIndustrialClassification() { return companyIndustrialClassification; }
    public void setCompanyIndustrialClassification(String companyIndustrialClassification) { this.companyIndustrialClassification = companyIndustrialClassification; }
    public String getOfficialWebsite() { return officialWebsite; }
    public void setOfficialWebsite(String officialWebsite) { this.officialWebsite = officialWebsite; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
