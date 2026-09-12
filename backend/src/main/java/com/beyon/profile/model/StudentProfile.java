package com.beyon.profile.model;

import com.beyon.profile.enums.PlacementPreference;
import com.beyon.profile.enums.WorkType;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "varchar(36)")
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID userId;

    @Column(length = 20)
    private String phone;

    private LocalDate dateOfBirth;

    @Column(length = 20)
    private String gender;

    @Column(length = 100)
    private String country;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    private String city;

    @Column(length = 200)
    private String institution;

    @Column(length = 50)
    private String registrationNumber;

    @Column(length = 100)
    private String degree;

    @Column(length = 200)
    private String department;

    @Column(length = 30)
    private String academicYear;

    @Column(precision = 4, scale = 2)
    private java.math.BigDecimal cgpa;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private PlacementPreference placementPreference;

    @Column(columnDefinition = "TEXT")
    private String preferredJobRoles;

    @Column(columnDefinition = "TEXT")
    private String preferredIndustries;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private WorkType preferredWorkType;

    @Column(length = 50)
    private String username;

    private Integer graduationYear;

    @Column(columnDefinition = "TEXT")
    private String preferredLocations;

    @Column(columnDefinition = "TEXT")
    private String aboutMe;

    @Column(length = 500)
    private String resumeUrl;

    @Column(length = 500)
    private String profilePhotoUrl;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "middle_name", length = 100)
    private String middleName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "aicte_code", length = 50)
    private String aicteCode;

    @Column(name = "student_id_card_url", length = 500)
    private String studentIdCardUrl;

    @Column(name = "education_10th", columnDefinition = "TEXT")
    private String education10th;

    @Column(name = "education_12th", columnDefinition = "TEXT")
    private String education12th;

    @Column(name = "education_diploma", columnDefinition = "TEXT")
    private String educationDiploma;

    @Column(name = "internship_experience", columnDefinition = "TEXT")
    private String internshipExperience;

    @Column(name = "verification_status", length = 30)
    private String verificationStatus = "PENDING";

    @JsonProperty("hasCompletedAssessment")
    @Column(name = "has_completed_assessment", nullable = false)
    private boolean hasCompletedAssessment = false;

    @Column(name = "assessment_completed_at")
    private Instant assessmentCompletedAt;

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
    public java.math.BigDecimal getCgpa() { return cgpa; }
    public void setCgpa(java.math.BigDecimal cgpa) { this.cgpa = cgpa; }
    public PlacementPreference getPlacementPreference() { return placementPreference; }
    public void setPlacementPreference(PlacementPreference placementPreference) { this.placementPreference = placementPreference; }
    public String getPreferredJobRoles() { return preferredJobRoles; }
    public void setPreferredJobRoles(String preferredJobRoles) { this.preferredJobRoles = preferredJobRoles; }
    public String getPreferredIndustries() { return preferredIndustries; }
    public void setPreferredIndustries(String preferredIndustries) { this.preferredIndustries = preferredIndustries; }
    public WorkType getPreferredWorkType() { return preferredWorkType; }
    public void setPreferredWorkType(WorkType preferredWorkType) { this.preferredWorkType = preferredWorkType; }
    public String getAboutMe() { return aboutMe; }
    public void setAboutMe(String aboutMe) { this.aboutMe = aboutMe; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }
    public int getCompletionPct() { return completionPct; }
    public void setCompletionPct(int completionPct) { this.completionPct = completionPct; }
    public Instant getCreatedAt() { return createdAt; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
    public String getPreferredLocations() { return preferredLocations; }
    public void setPreferredLocations(String preferredLocations) { this.preferredLocations = preferredLocations; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getAicteCode() { return aicteCode; }
    public void setAicteCode(String aicteCode) { this.aicteCode = aicteCode; }
    public String getStudentIdCardUrl() { return studentIdCardUrl; }
    public void setStudentIdCardUrl(String studentIdCardUrl) { this.studentIdCardUrl = studentIdCardUrl; }
    public String getEducation10th() { return education10th; }
    public void setEducation10th(String education10th) { this.education10th = education10th; }
    public String getEducation12th() { return education12th; }
    public void setEducation12th(String education12th) { this.education12th = education12th; }
    public String getEducationDiploma() { return educationDiploma; }
    public void setEducationDiploma(String educationDiploma) { this.educationDiploma = educationDiploma; }
    public String getInternshipExperience() { return internshipExperience; }
    public void setInternshipExperience(String internshipExperience) { this.internshipExperience = internshipExperience; }
    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
    public boolean isHasCompletedAssessment() { return hasCompletedAssessment; }
    public boolean getHasCompletedAssessment() { return hasCompletedAssessment; }
    public void setHasCompletedAssessment(boolean hasCompletedAssessment) { this.hasCompletedAssessment = hasCompletedAssessment; }
    public Instant getAssessmentCompletedAt() { return assessmentCompletedAt; }
    public void setAssessmentCompletedAt(Instant assessmentCompletedAt) { this.assessmentCompletedAt = assessmentCompletedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}

