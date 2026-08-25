package com.beyon.profile.dto;

import com.beyon.identity.enums.UserRole;
import com.beyon.profile.model.*;
import com.beyon.identity.model.User;
import java.util.List;

public class ProfileResponse {

    private UserInfo user;
    private StudentProfileData studentProfile;
    private InstitutionProfileData institutionProfile;
    private CompanyProfileData companyProfile;

    public UserInfo getUser() { return user; }
    public void setUser(UserInfo user) { this.user = user; }
    public StudentProfileData getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfileData studentProfile) { this.studentProfile = studentProfile; }
    public InstitutionProfileData getInstitutionProfile() { return institutionProfile; }
    public void setInstitutionProfile(InstitutionProfileData institutionProfile) { this.institutionProfile = institutionProfile; }
    public CompanyProfileData getCompanyProfile() { return companyProfile; }
    public void setCompanyProfile(CompanyProfileData companyProfile) { this.companyProfile = companyProfile; }

    public static class UserInfo {
        private String id;
        private String email;
        private String name;
        private UserRole role;
        private String status;
        private boolean emailVerified;
        private boolean profileCompleted;

        public UserInfo(User user, boolean profileCompleted) {
            this.id = user.getId().toString();
            this.email = user.getEmail();
            this.name = user.getDisplayName();
            this.role = user.getRole();
            this.status = user.getStatus().name();
            this.emailVerified = user.isEmailVerified();
            this.profileCompleted = profileCompleted;
        }

        public String getId() { return id; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public UserRole getRole() { return role; }
        public String getStatus() { return status; }
        public boolean isEmailVerified() { return emailVerified; }
        public boolean isProfileCompleted() { return profileCompleted; }
    }

    public static class StudentProfileData {
        private StudentProfile profile;
        private List<StudentSkill> skills;
        private List<StudentCertification> certifications;
        private List<StudentProject> projects;
        private List<StudentLink> links;

        public StudentProfile getProfile() { return profile; }
        public void setProfile(StudentProfile profile) { this.profile = profile; }
        public List<StudentSkill> getSkills() { return skills; }
        public void setSkills(List<StudentSkill> skills) { this.skills = skills; }
        public List<StudentCertification> getCertifications() { return certifications; }
        public void setCertifications(List<StudentCertification> certifications) { this.certifications = certifications; }
        public List<StudentProject> getProjects() { return projects; }
        public void setProjects(List<StudentProject> projects) { this.projects = projects; }
        public List<StudentLink> getLinks() { return links; }
        public void setLinks(List<StudentLink> links) { this.links = links; }
    }

    public static class InstitutionProfileData {
        private InstitutionProfile profile;
        private List<InstitutionPlacementHistory> placementHistory;
        private List<InstitutionRepresentative> representatives;

        public InstitutionProfile getProfile() { return profile; }
        public void setProfile(InstitutionProfile profile) { this.profile = profile; }
        public List<InstitutionPlacementHistory> getPlacementHistory() { return placementHistory; }
        public void setPlacementHistory(List<InstitutionPlacementHistory> placementHistory) { this.placementHistory = placementHistory; }
        public List<InstitutionRepresentative> getRepresentatives() { return representatives; }
        public void setRepresentatives(List<InstitutionRepresentative> representatives) { this.representatives = representatives; }
    }

    public static class CompanyProfileData {
        private CompanyProfile profile;
        private CompanyHiringPreference hiringPreferences;
        private List<CompanySkill> skills;
        private List<CompanyRepresentative> representatives;

        public CompanyProfile getProfile() { return profile; }
        public void setProfile(CompanyProfile profile) { this.profile = profile; }
        public CompanyHiringPreference getHiringPreferences() { return hiringPreferences; }
        public void setHiringPreferences(CompanyHiringPreference hiringPreferences) { this.hiringPreferences = hiringPreferences; }
        public List<CompanySkill> getSkills() { return skills; }
        public void setSkills(List<CompanySkill> skills) { this.skills = skills; }
        public List<CompanyRepresentative> getRepresentatives() { return representatives; }
        public void setRepresentatives(List<CompanyRepresentative> representatives) { this.representatives = representatives; }
    }
}
