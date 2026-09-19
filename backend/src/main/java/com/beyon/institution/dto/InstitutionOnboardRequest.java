package com.beyon.institution.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class InstitutionOnboardRequest {

    @NotBlank(message = "AICTE ID is required")
    private String aicteId;

    @NotBlank(message = "Institution name is required")
    private String institutionName;

    @NotBlank(message = "Principal name is required")
    private String principalName;

    @NotBlank(message = "Principal official email is required")
    @Email(message = "Invalid principal email format")
    private String principalEmail;

    private String principalMobile;
    private String officialEmail;
    private String phone;
    private String website;
    private String institutionType;
    private String city;
    private String state;
    private String address;
    private String affiliatedUniversity;
    private String accreditationGrade;

    public String getAicteId() { return aicteId; }
    public void setAicteId(String aicteId) { this.aicteId = aicteId; }
    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }
    public String getPrincipalName() { return principalName; }
    public void setPrincipalName(String principalName) { this.principalName = principalName; }
    public String getPrincipalEmail() { return principalEmail; }
    public void setPrincipalEmail(String principalEmail) { this.principalEmail = principalEmail; }
    public String getPrincipalMobile() { return principalMobile; }
    public void setPrincipalMobile(String principalMobile) { this.principalMobile = principalMobile; }
    public String getOfficialEmail() { return officialEmail; }
    public void setOfficialEmail(String officialEmail) { this.officialEmail = officialEmail; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getInstitutionType() { return institutionType; }
    public void setInstitutionType(String institutionType) { this.institutionType = institutionType; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getAffiliatedUniversity() { return affiliatedUniversity; }
    public void setAffiliatedUniversity(String affiliatedUniversity) { this.affiliatedUniversity = affiliatedUniversity; }
    public String getAccreditationGrade() { return accreditationGrade; }
    public void setAccreditationGrade(String accreditationGrade) { this.accreditationGrade = accreditationGrade; }
}
