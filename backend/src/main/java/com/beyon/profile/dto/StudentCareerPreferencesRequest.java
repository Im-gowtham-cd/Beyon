package com.beyon.profile.dto;

import java.util.List;

public class StudentCareerPreferencesRequest {
    private List<String> preferredRoles;
    private List<String> preferredIndustries;
    private String preferredWorkType;
    private List<String> preferredLocations;
    private String careerGoal;

    public List<String> getPreferredRoles() { return preferredRoles; }
    public void setPreferredRoles(List<String> preferredRoles) { this.preferredRoles = preferredRoles; }
    public List<String> getPreferredIndustries() { return preferredIndustries; }
    public void setPreferredIndustries(List<String> preferredIndustries) { this.preferredIndustries = preferredIndustries; }
    public String getPreferredWorkType() { return preferredWorkType; }
    public void setPreferredWorkType(String preferredWorkType) { this.preferredWorkType = preferredWorkType; }
    public List<String> getPreferredLocations() { return preferredLocations; }
    public void setPreferredLocations(List<String> preferredLocations) { this.preferredLocations = preferredLocations; }
    public String getCareerGoal() { return careerGoal; }
    public void setCareerGoal(String careerGoal) { this.careerGoal = careerGoal; }
}
