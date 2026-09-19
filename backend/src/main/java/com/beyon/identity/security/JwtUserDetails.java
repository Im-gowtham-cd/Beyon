package com.beyon.identity.security;

public class JwtUserDetails {

    private final String userId;
    private final String email;
    private final String role;
    private final String institutionId;
    private final String companyId;
    private final String departmentId;

    public JwtUserDetails(String userId, String email, String role) {
        this(userId, email, role, null, null, null);
    }

    public JwtUserDetails(String userId, String email, String role, String institutionId, String companyId, String departmentId) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.institutionId = institutionId;
        this.companyId = companyId;
        this.departmentId = departmentId;
    }

    public String getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getInstitutionId() {
        return institutionId;
    }

    public String getCompanyId() {
        return companyId;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public boolean isSuperAdmin() {
        return "SUPER_ADMIN".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role) || "PLATFORM_ADMIN".equalsIgnoreCase(role);
    }

    public boolean isInstitutionManager() {
        return "INSTITUTION_MANAGER".equalsIgnoreCase(role);
    }

    public boolean isPrincipal() {
        return "PRINCIPAL".equalsIgnoreCase(role);
    }

    public boolean isPlacementCoordinator() {
        return "PLACEMENT_COORDINATOR".equalsIgnoreCase(role);
    }

    public boolean isDepartmentIncharge() {
        return "DEPARTMENT_PLACEMENT_INCHARGE".equalsIgnoreCase(role);
    }

    public boolean isInstitutionTier() {
        if (role == null) return false;
        String r = role.toUpperCase();
        return r.startsWith("INSTITUTION") ||
               "PRINCIPAL".equals(r) ||
               "PLACEMENT_COORDINATOR".equals(r) ||
               "DEPARTMENT_PLACEMENT_INCHARGE".equals(r);
    }

    public boolean isCompanyTier() {
        return role != null && role.toUpperCase().startsWith("COMPANY");
    }

    public boolean isStudentTier() {
        return "STUDENT".equalsIgnoreCase(role);
    }
}

