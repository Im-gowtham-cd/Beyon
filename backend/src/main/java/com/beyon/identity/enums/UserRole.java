package com.beyon.identity.enums;

public enum UserRole {
    // 1. Platform Tier (Super Admin Domain)
    PLATFORM_ADMIN,
    VERIFICATION_ADMIN,
    CONTENT_ADMIN,
    QUESTION_SETTER,
    MODERATION_ADMIN,
    ANALYTICS_ADMIN,
    SUPER_ADMIN,
    ADMIN,

    // 2. Institution Tier (Academia Domain)
    INSTITUTION_ADMIN,
    INSTITUTION_PLACEMENT_OFFICER,
    INSTITUTION_FACULTY,
    INSTITUTION_COORDINATOR,
    INSTITUTION_VIEWER,
    INSTITUTION,

    // 3. Company Tier (Industry & Hiring Domain)
    COMPANY_ADMIN,
    COMPANY_RECRUITER,
    COMPANY_HR,
    COMPANY_HIRING_MANAGER,
    COMPANY_INTERVIEWER,
    COMPANY_LEARNING_MANAGER,
    COMPANY,

    // 4. Student Tier (Candidate Experience)
    STUDENT;

    public boolean isSuperAdmin() {
        return this == SUPER_ADMIN ||
               this == ADMIN ||
               this == PLATFORM_ADMIN ||
               this == VERIFICATION_ADMIN ||
               this == CONTENT_ADMIN ||
               this == QUESTION_SETTER ||
               this == MODERATION_ADMIN ||
               this == ANALYTICS_ADMIN;
    }

    public boolean isInstitutionTier() {
        return this == INSTITUTION ||
               this == INSTITUTION_ADMIN ||
               this == INSTITUTION_PLACEMENT_OFFICER ||
               this == INSTITUTION_FACULTY ||
               this == INSTITUTION_COORDINATOR ||
               this == INSTITUTION_VIEWER;
    }

    public boolean isCompanyTier() {
        return this == COMPANY ||
               this == COMPANY_ADMIN ||
               this == COMPANY_RECRUITER ||
               this == COMPANY_HR ||
               this == COMPANY_HIRING_MANAGER ||
               this == COMPANY_INTERVIEWER ||
               this == COMPANY_LEARNING_MANAGER;
    }

    public boolean isStudentTier() {
        return this == STUDENT;
    }

    public String getTier() {
        if (isSuperAdmin()) return "SUPER_ADMIN";
        if (isInstitutionTier()) return "INSTITUTION";
        if (isCompanyTier()) return "COMPANY";
        return "STUDENT";
    }
}

