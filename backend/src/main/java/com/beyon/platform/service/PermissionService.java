package com.beyon.platform.service;

import com.beyon.identity.enums.UserRole;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.platform.model.Permission;
import com.beyon.platform.model.RolePermissions;
import com.beyon.platform.repository.PermissionRepository;
import com.beyon.platform.repository.RolePermissionsRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PermissionService {

    private final PermissionRepository permissionRepo;
    private final RolePermissionsRepository rolePermRepo;
    private final UserRepository userRepo;

    private static final Map<String, Set<String>> ROLE_PERMISSIONS = new ConcurrentHashMap<>();

    static {
        // ==========================================
        // 1. SUPER ADMIN PLATFORM DOMAIN
        // ==========================================

        // 1.1 Platform Admin / Super Admin (Full Governance)
        Set<String> platformAdminPerms = Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE", "MANAGE_USERS", "MANAGE_ALL",
            "VIEW_ALL_ANALYTICS", "MODERATE_CONTENT", "MANAGE_REPORTS",
            "VIEW_AUDIT_LOGS", "MANAGE_PERMISSIONS", "MANAGE_PLATFORM",
            "REVIEW_FRAUD", "MANAGE_FEEDBACK", "EXPORT_DATA",
            "platform:config", "platform:settings", "platform:features", "platform:subscriptions",
            "users:manage", "roles:manage", "permissions:manage", "accounts:suspend", "accounts:delete",
            "institutions:manage", "companies:manage", "institutions:approve", "companies:approve",
            "institution:manage", "company:manage", "institution:approve", "company:approve",
            "system:settings", "audit:read", "analytics:platform", "platform:moderate",
            "student:read", "student:verify", "skill:read", "skill:create", "skill:update",
            "assessment:create", "assessment:publish", "course:create", "course:publish",
            "placement:verify", "placement:report", "job:moderate"
        );
        ROLE_PERMISSIONS.put("PLATFORM_ADMIN", platformAdminPerms);
        ROLE_PERMISSIONS.put("SUPER_ADMIN", platformAdminPerms);
        ROLE_PERMISSIONS.put("ADMIN", platformAdminPerms);

        // 1.2 Verification Admin (Verify Organizations & Credential Evidence)
        Set<String> verificationAdminPerms = Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE", "MODERATE_CONTENT", "VIEW_AUDIT_LOGS",
            "verification:dashboard", "verification:history", "verification:request_info",
            "institution:verify", "institution:approve", "institution:reject", "institution:details",
            "company:verify", "company:approve", "company:reject", "company:details",
            "student:verify", "student:read",
            "certificate:verify", "project:verify"
        );
        ROLE_PERMISSIONS.put("VERIFICATION_ADMIN", verificationAdminPerms);

        // 1.3 Content / Skill Admin (Global Learning & Skill Ecosystem)
        Set<String> contentAdminPerms = Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE", "VIEW_ALL_ANALYTICS",
            "content:dashboard", "content:approve",
            "skill:create", "skill:edit", "skill:update", "skill:read", "skill:delete",
            "skill_category:manage", "taxonomy:manage",
            "career_role:create", "career_role:edit", "skill_role_mapping:manage",
            "course:create", "course:edit", "course:publish", "course:catalog",
            "learning_path:create", "learning_path:edit", "learning_resource:manage",
            "certifications:manage"
        );
        ROLE_PERMISSIONS.put("CONTENT_ADMIN", contentAdminPerms);

        // 1.4 Question Setter (Daily Questions & Assessment Authoring)
        // Explicit rule: Cannot directly modify a student's skill score!
        Set<String> questionSetterPerms = Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE",
            "question:dashboard", "question:bank_view",
            "question:create", "question:edit", "question:read", "question:review",
            "question:map_skills", "question:difficulty", "question:categories",
            "question:mcq_create", "question:coding_create", "question:sql_create", "question:theory_create", "question:testcases",
            "assessment:create", "assessment:template_create", "assessment:questions_manage",
            "assessment:review", "assessment:analytics",
            "student_answers:read_only"
        );
        ROLE_PERMISSIONS.put("QUESTION_SETTER", questionSetterPerms);

        // 1.5 Support / Moderation Admin (Abuse, Disputes, Platform Support)
        Set<String> moderationAdminPerms = Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE", "VIEW_AUDIT_LOGS",
            "support:dashboard", "support:tickets",
            "user_reports:manage", "org_reports:manage", "job_reports:manage", "content_reports:manage",
            "disputes:resolve", "content:moderate", "account:suspend_limited", "moderation:history"
        );
        ROLE_PERMISSIONS.put("MODERATION_ADMIN", moderationAdminPerms);

        // 1.6 Analytics Admin (Platform-Level Intelligence, Read-Only)
        Set<String> analyticsAdminPerms = Set.of(
            "VIEW_PROFILE", "VIEW_ALL_ANALYTICS",
            "analytics:platform", "analytics:user", "analytics:institution", "analytics:company",
            "analytics:skill_demand", "analytics:learning", "analytics:placement", "analytics:assessment",
            "analytics:internship", "analytics:ai_recommendations", "reports:read"
        );
        ROLE_PERMISSIONS.put("ANALYTICS_ADMIN", analyticsAdminPerms);


        // ==========================================
        // 2. INSTITUTION DOMAIN (ACADEMIA ECOSYSTEM)
        // ==========================================

        // 2.1 Institution Admin (Highest Institution Authority)
        Set<String> institutionAdminPerms = Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE", "MANAGE_STUDENTS", "MANAGE_PLACEMENTS",
            "VIEW_ANALYTICS", "CREATE_EVENT", "CREATE_POST", "COMMENT",
            "CREATE_LEARNING_PROGRAM", "MANAGE_DEPARTMENTS", "REPORT_CONTENT",
            "VIEW_OWN_CERTIFICATES",
            "institution:dashboard", "institution:profile", "institution:settings", "institution:verification",
            "departments:manage", "batches:manage", "faculty:manage", "institution_users:manage",
            "students:manage", "student:read", "student:verify", "student:update",
            "placement:verify", "placement:report", "placements:manage", "company_connections:manage",
            "course:recommend", "course:create", "drives:manage",
            "analytics:institution", "analytics:students", "analytics:skills", "analytics:placement", "analytics:internship",
            "skill:read"
        );
        ROLE_PERMISSIONS.put("INSTITUTION_ADMIN", institutionAdminPerms);
        ROLE_PERMISSIONS.put("INSTITUTION", institutionAdminPerms);

        // 2.2 Placement Officer (Operational Placement & Internships)
        Set<String> placementOfficerPerms = Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE", "MANAGE_STUDENTS", "MANAGE_PLACEMENTS",
            "VIEW_ANALYTICS", "CREATE_EVENT", "REPORT_CONTENT",
            "placement:dashboard", "placement:overview",
            "drives:create", "drives:manage",
            "students:eligible_view", "students:nominate", "student:read", "student:verify",
            "student_skills:view", "student_portfolio:view",
            "applications:track", "interviews:track", "offers:track",
            "placement:verify", "placement:report", "placement:status_update", "placement:reports",
            "company_opportunities:view", "internships:track", "internships:opportunities_view", "internships:applications_track",
            "analytics:institution"
        );
        ROLE_PERMISSIONS.put("INSTITUTION_PLACEMENT_OFFICER", placementOfficerPerms);

        // 2.3 Faculty / Department Coordinator (Student Skill Development)
        Set<String> facultyPerms = Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE", "VIEW_ANALYTICS",
            "faculty:dashboard",
            "department_students:view", "student:read", "student:verify",
            "student_skill_profile:view", "skill:read", "skill_gaps:view",
            "learning_progress:view", "assessment_performance:view",
            "learning:recommend", "course:recommend",
            "academic_projects:verify", "certifications:verify",
            "analytics:department", "faculty:reports"
        );
        ROLE_PERMISSIONS.put("INSTITUTION_FACULTY", facultyPerms);
        ROLE_PERMISSIONS.put("INSTITUTION_COORDINATOR", facultyPerms);

        // 2.4 Institution Viewer (Read-Only)
        Set<String> institutionViewerPerms = Set.of(
            "VIEW_PROFILE", "VIEW_ANALYTICS",
            "dashboard:view", "students:read", "skills:read",
            "placements:read", "internships:read", "analytics:read", "reports:read"
        );
        ROLE_PERMISSIONS.put("INSTITUTION_VIEWER", institutionViewerPerms);


        // ==========================================
        // 3. COMPANY DOMAIN (INDUSTRY & HIRING)
        // ==========================================

        // 3.1 Company Admin (Highest Authority inside Company)
        Set<String> companyAdminPerms = Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE", "CREATE_JOB", "CREATE_ASSESSMENT",
            "MANAGE_APPLICATIONS", "VIEW_CANDIDATES", "VIEW_ANALYTICS",
            "CREATE_CHALLENGE", "CREATE_EVENT", "CREATE_LIVE_PROJECT",
            "CREATE_POST", "COMMENT", "REPORT_CONTENT", "MANAGE_RECRUITMENT",
            "company:dashboard", "company:profile", "company:team", "company:roles", "company:settings",
            "company:verification", "company:audit_logs",
            "jobs:manage", "job:create", "job:edit", "job:publish", "job:update", "job:close",
            "internships:manage", "internship:create", "internship:publish",
            "assessments:manage", "assessment:create", "assessment:publish", "assessment:evaluate",
            "candidates:manage", "application:read", "application:shortlist", "application:reject",
            "interviews:manage", "interview:schedule", "interview:conduct", "interview:evaluate",
            "offers:manage", "offer:create", "offer:update", "offer:read",
            "learning_programs:manage", "workshops:manage", "mentorship:manage", "industry_skills:manage",
            "analytics:company", "placement:report", "skill:define"
        );
        ROLE_PERMISSIONS.put("COMPANY_ADMIN", companyAdminPerms);
        ROLE_PERMISSIONS.put("COMPANY", companyAdminPerms);

        // 3.2 Recruiter (Day-to-Day Recruitment Operator)
        Set<String> recruiterPerms = Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE", "CREATE_JOB", "CREATE_ASSESSMENT",
            "MANAGE_APPLICATIONS", "VIEW_CANDIDATES", "MANAGE_RECRUITMENT",
            "recruiter:dashboard",
            "job:create", "job:edit", "job:publish", "job:update", "job:close",
            "internship:create", "internship:publish",
            "applications:view", "application:read", "application:shortlist", "application:reject",
            "candidates:filter", "candidates:shortlist", "candidates:reject", "candidate:search",
            "interview:schedule", "assessment:create", "assessment:publish",
            "portfolios:view", "verified_skills:view", "pipeline:manage",
            "offer:create", "offer:update", "offer:read"
        );
        ROLE_PERMISSIONS.put("COMPANY_RECRUITER", recruiterPerms);

        // 3.3 HR (People, Candidate Communication & Offers)
        Set<String> hrPerms = Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE", "MANAGE_APPLICATIONS", "VIEW_CANDIDATES",
            "hr:dashboard",
            "applications:view", "application:read", "candidate_communication:manage",
            "interview:schedule", "pipeline:view",
            "offers:manage", "offer:manage", "offer:create", "offer:edit", "offer:update", "offer:read", "offer:status",
            "onboarding:manage", "recruitment_reports:view", "hiring_history:view",
            "candidate_portfolio:view", "candidate_skills:view", "technical_evaluation:view"
        );
        ROLE_PERMISSIONS.put("COMPANY_HR", hrPerms);

        // 3.4 Hiring Manager (Decision-Maker for Specific Roles/Teams)
        Set<String> hiringManagerPerms = Set.of(
            "VIEW_PROFILE", "VIEW_CANDIDATES", "MANAGE_APPLICATIONS",
            "hiring:dashboard",
            "open_positions:view", "recommended_candidates:view", "shortlisted_candidates:view",
            "candidates:compare", "candidates:shortlist", "candidates:reject",
            "candidate_skill_profile:view", "candidate_portfolio:view", "assessment_results:view",
            "application:read", "application:shortlist", "application:reject",
            "interview:evaluate", "interview_feedback:view", "hiring:decision",
            "offer:create", "offer:read", "skill:define"
        );
        ROLE_PERMISSIONS.put("COMPANY_HIRING_MANAGER", hiringManagerPerms);

        // 3.5 Interviewer (Restricted Candidate Evaluation)
        Set<String> interviewerPerms = Set.of(
            "VIEW_PROFILE",
            "interviewer:dashboard",
            "assigned_interviews:view", "candidate_profile:view", "interview_workspace:access",
            "relevant_skills:view", "interview_questions:view",
            "interview:conduct", "interview:evaluate", "feedback:submit", "own_feedback:view"
        );
        ROLE_PERMISSIONS.put("COMPANY_INTERVIEWER", interviewerPerms);

        // 3.6 Learning Manager (Industry Learning & Programs)
        Set<String> learningManagerPerms = Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE", "CREATE_EVENT", "CREATE_LIVE_PROJECT",
            "learning:dashboard", "learning_programs:manage", "course:create", "course:publish",
            "workshop:create", "mentorship:publish", "recommended_skills:define", "skill:define"
        );
        ROLE_PERMISSIONS.put("COMPANY_LEARNING_MANAGER", learningManagerPerms);


        // ==========================================
        // 4. STUDENT / CANDIDATE DOMAIN
        // ==========================================
        Set<String> studentPerms = Set.of(
            "VIEW_PROFILE", "EDIT_PROFILE", "PRACTICE", "TAKE_ASSESSMENT",
            "VIEW_OPPORTUNITY", "APPLY_OPPORTUNITY", "VIEW_OWN_RESULTS",
            "MANAGE_OWN_COINS", "CREATE_POST", "COMMENT", "FOLLOW",
            "REQUEST_MENTORSHIP", "REGISTER_EVENT", "PARTICIPATE_CHALLENGE",
            "VIEW_OWN_CERTIFICATES", "EXPORT_OWN_DATA", "MANAGE_PRIVACY",
            "REPORT_CONTENT",
            "student:read", "student:update",
            "practice:take", "daily_challenges:take", "assessment:take",
            "learning_path:view", "courses:learn", "course:learn",
            "skills:view", "skill:read", "skills:add_own",
            "career_explorer:view", "jobs:recommendations_view", "jobs:apply",
            "internships:apply", "application:create", "application:read", "applications:view_own",
            "interview:attend", "offers:view_own", "offer:read",
            "portfolio:manage", "certifications:add", "projects:add",
            "coins:manage", "xp:earn"
        );
        ROLE_PERMISSIONS.put("STUDENT", studentPerms);
    }

    public PermissionService(PermissionRepository permissionRepo,
                             RolePermissionsRepository rolePermRepo,
                             UserRepository userRepo) {
        this.permissionRepo = permissionRepo;
        this.rolePermRepo = rolePermRepo;
        this.userRepo = userRepo;
    }

    public boolean hasPermission(UUID userId, String permission) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) return false;
        Set<String> perms = ROLE_PERMISSIONS.getOrDefault(user.getRole().name(), Set.of());
        return perms.contains(permission);
    }

    /**
     * Checks if a user has a specific permission within an organization scope.
     * Enforces domain isolation so users from one institution/company cannot mutate data of another.
     */
    public boolean hasPermission(UUID userId, String resource, String action, UUID targetOrgId) {
        String permission = resource + ":" + action;
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) return false;

        // Verify base permission first
        Set<String> perms = ROLE_PERMISSIONS.getOrDefault(user.getRole().name(), Set.of());
        if (!perms.contains(permission)) {
            return false;
        }

        // Super admins have platform-wide scope
        if (user.getRole().isSuperAdmin()) {
            return true;
        }

        // If target scope is provided, enforce organizational boundary
        if (targetOrgId != null) {
            if (user.getRole().isInstitutionTier()) {
                UUID userInstId = user.getInstitutionId() != null ? user.getInstitutionId() : user.getId();
                return targetOrgId.equals(userInstId);
            } else if (user.getRole().isCompanyTier()) {
                UUID userCompId = user.getCompanyId() != null ? user.getCompanyId() : user.getId();
                return targetOrgId.equals(userCompId);
            } else if (user.getRole().isStudentTier()) {
                return targetOrgId.equals(user.getId());
            }
        }

        return true;
    }

    /**
     * Enforces the 4-dimensional authorization rule:
     * ROLE + PERMISSION + ORGANIZATION SCOPE + RESOURCE OWNERSHIP
     *
     * @param userId The authenticated actor's UUID
     * @param resource Target resource type (e.g. "application", "student", "interview", "job")
     * @param action Action requested (e.g. "read", "verify", "evaluate", "create")
     * @param targetOrgId Organization scope (e.g. company_id or institution_id)
     * @param resourceOwnerId Direct resource assignment/owner (e.g. assigned interviewer, student_id)
     * @return true if all 4 dimensions authorize the action
     */
    public boolean checkAccess(UUID userId, String resource, String action, UUID targetOrgId, UUID resourceOwnerId) {
        if (!hasPermission(userId, resource, action, targetOrgId)) {
            return false;
        }

        User user = userRepo.findById(userId).orElse(null);
        if (user == null) return false;

        // Platform Super Admin platform authority
        if (user.getRole().isSuperAdmin()) {
            return true;
        }

        // Specific restricted roles require direct resource assignment
        if (user.getRole() == UserRole.COMPANY_INTERVIEWER) {
            if (resourceOwnerId != null && !resourceOwnerId.equals(userId)) {
                return false;
            }
        }

        // Candidates can only operate on their own candidate records
        if (user.getRole().isStudentTier()) {
            if (resourceOwnerId != null && !resourceOwnerId.equals(userId)) {
                return false;
            }
        }

        return true;
    }

    public Set<String> getPermissionsForRole(String role) {
        return ROLE_PERMISSIONS.getOrDefault(role, Set.of());
    }

    public Set<String> getPermissionsForUser(UUID userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) return Set.of();
        return getPermissionsForRole(user.getRole().name());
    }

    public List<String> getAllPermissions() {
        Set<String> all = new HashSet<>();
        ROLE_PERMISSIONS.values().forEach(all::addAll);
        return all.stream().sorted().toList();
    }

    public Map<String, Set<String>> getRolePermissionMatrix() {
        return new HashMap<>(ROLE_PERMISSIONS);
    }
}

