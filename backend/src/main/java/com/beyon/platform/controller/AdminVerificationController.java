package com.beyon.platform.controller;

import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.common.response.ApiResponse;
import com.beyon.identity.enums.AccountStatus;
import com.beyon.identity.enums.AuditEventType;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.identity.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.beyon.identity.security.JwtUserDetails;
import org.springframework.security.core.Authentication;
import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/verifications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminVerificationController {

    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;
    private final AuditService auditService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.beyon.profile.service.CompanyVerificationService companyVerificationService;
    private final com.beyon.profile.repository.CompanyVerificationRepository companyVerificationRepository;
    private final com.beyon.profile.repository.CompanyVerificationCheckRepository companyVerificationCheckRepository;
    private final com.beyon.profile.repository.CompanyDocumentRepository companyDocumentRepository;
    private final com.beyon.profile.repository.VerificationAuditLogRepository verificationAuditLogRepository;

    public AdminVerificationController(UserRepository userRepository,
                                       JdbcTemplate jdbcTemplate,
                                       AuditService auditService,
                                       org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
                                       com.beyon.profile.service.CompanyVerificationService companyVerificationService,
                                       com.beyon.profile.repository.CompanyVerificationRepository companyVerificationRepository,
                                       com.beyon.profile.repository.CompanyVerificationCheckRepository companyVerificationCheckRepository,
                                       com.beyon.profile.repository.CompanyDocumentRepository companyDocumentRepository,
                                       com.beyon.profile.repository.VerificationAuditLogRepository verificationAuditLogRepository) {
        this.userRepository = userRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.auditService = auditService;
        this.passwordEncoder = passwordEncoder;
        this.companyVerificationService = companyVerificationService;
        this.companyVerificationRepository = companyVerificationRepository;
        this.companyVerificationCheckRepository = companyVerificationCheckRepository;
        this.companyDocumentRepository = companyDocumentRepository;
        this.verificationAuditLogRepository = verificationAuditLogRepository;
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPendingVerifications() {
        List<Map<String, Object>> pendingInstitutions = jdbcTemplate.queryForList(
                "SELECT ip.id, ip.user_id AS userId, ip.institution_name AS name, ip.institution_type AS type, " +
                "ip.institution_code AS code, ip.official_email AS officialEmail, ip.phone, ip.website, " +
                "ip.address, ip.city, ip.state, ip.country, ip.postal_code AS postalCode, " +
                "ip.affiliated_university AS affiliatedUniversity, ip.accreditations, ip.accreditation_grade AS grade, " +
                "ip.established_year AS establishedYear, ip.total_students AS totalStudents, " +
                "u.email AS loginEmail, u.status, u.profile_status AS profileStatus, ip.created_at AS createdAt " +
                "FROM institution_profiles ip " +
                "JOIN users u ON u.id = ip.user_id " +
                "WHERE u.status IN ('PENDING_SUPER_ADMIN_VERIFICATION', 'PENDING_VERIFICATION') " +
                "ORDER BY ip.created_at DESC"
        );

        List<Map<String, Object>> pendingCompanies = jdbcTemplate.queryForList(
                "SELECT cp.id, cp.user_id AS userId, cp.company_name AS name, cp.company_type AS type, " +
                "cp.industry, cp.website, cp.official_email AS officialEmail, cp.phone, " +
                "cp.headquarters, cp.city, cp.state, cp.country, cp.company_size AS size, cp.about, " +
                "u.email AS loginEmail, u.status, u.profile_status AS profileStatus, cp.created_at AS createdAt " +
                "FROM company_profiles cp " +
                "JOIN users u ON u.id = cp.user_id " +
                "WHERE u.status IN ('PENDING_SUPER_ADMIN_VERIFICATION', 'PENDING_VERIFICATION') " +
                "ORDER BY cp.created_at DESC"
        );

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("institutions", pendingInstitutions);
        response.put("companies", pendingCompanies);
        response.put("totalPending", pendingInstitutions.size() + pendingCompanies.size());

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/institution/{userId}/approve")
    public ResponseEntity<ApiResponse<Map<String, Object>>> approveInstitution(
            @PathVariable UUID userId,
            @RequestBody(required = false) Map<String, String> body) {

        User user = resolveInstitutionUser(userId);

        user.setStatus(AccountStatus.ACTIVE);
        user.setProfileStatus(AccountStatus.COMPLETED);
        userRepository.save(user);

        String notes = body != null ? body.getOrDefault("notes", "Approved by Super Admin") : "Approved by Super Admin";
        auditService.log(AuditEventType.SUPER_ADMIN_APPROVAL, user.getEmail(), null, notes);

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "success", true,
                "status", "ACTIVE",
                "message", "Institution registration verified and approved by Super Admin"
        )));
    }

    @PostMapping("/institution/{userId}/reject")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rejectInstitution(
            @PathVariable UUID userId,
            @RequestBody(required = false) Map<String, String> body) {

        User user = resolveInstitutionUser(userId);

        user.setStatus(AccountStatus.REJECTED);
        user.setProfileStatus(AccountStatus.REJECTED);
        userRepository.save(user);

        String reason = body != null ? body.getOrDefault("reason", "Registration credentials did not meet criteria") : "Rejected by Super Admin";
        auditService.log(AuditEventType.SUPER_ADMIN_REJECTION, user.getEmail(), null, reason);

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "success", true,
                "status", "REJECTED",
                "message", "Institution registration rejected"
        )));
    }

    @PostMapping("/company/{userId}/approve")
    public ResponseEntity<ApiResponse<Map<String, Object>>> approveCompany(
            Authentication auth,
            @PathVariable UUID userId,
            @RequestBody(required = false) Map<String, String> body) {

        UUID adminId = extractAdminUserId(auth);
        String notes = body != null ? body.getOrDefault("notes", "Approved by Super Admin") : "Approved by Super Admin";

        companyVerificationService.approveVerification(adminId, userId, notes);

        User user = resolveCompanyUser(userId);
        auditService.log(AuditEventType.SUPER_ADMIN_APPROVAL, user.getEmail(), null, notes);

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "success", true,
                "status", "ACTIVE",
                "message", "Company corporate registration verified and approved by Super Admin"
        )));
    }

    @PostMapping("/company/{userId}/reject")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rejectCompany(
            Authentication auth,
            @PathVariable UUID userId,
            @RequestBody(required = false) Map<String, String> body) {

        UUID adminId = extractAdminUserId(auth);
        String reason = body != null ? body.getOrDefault("reason", "Corporate credentials did not meet verification criteria") : "Rejected by Super Admin";

        companyVerificationService.rejectVerification(adminId, userId, reason);

        User user = resolveCompanyUser(userId);
        auditService.log(AuditEventType.SUPER_ADMIN_REJECTION, user.getEmail(), null, reason);

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "success", true,
                "status", "REJECTED",
                "message", "Company registration rejected"
        )));
    }

    @PostMapping("/company/{userId}/request-documents")
    public ResponseEntity<ApiResponse<Map<String, Object>>> requestDocuments(
            Authentication auth,
            @PathVariable UUID userId,
            @RequestBody(required = false) Map<String, String> body) {

        UUID adminId = extractAdminUserId(auth);
        String notes = body != null ? body.getOrDefault("notes", "Additional legal incorporation documents requested.") : "Additional legal incorporation documents requested.";

        companyVerificationService.requestAdditionalDocuments(adminId, userId, notes);

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "success", true,
                "status", "MANUAL_REVIEW_DOCS_REQUESTED",
                "message", "Document request sent to company representative."
        )));
    }

    @PostMapping("/company/{userId}/suspend")
    public ResponseEntity<ApiResponse<Map<String, Object>>> suspendCompany(
            Authentication auth,
            @PathVariable UUID userId,
            @RequestBody(required = false) Map<String, String> body) {

        UUID adminId = extractAdminUserId(auth);
        String reason = body != null ? body.getOrDefault("reason", "Account suspended by Super Admin.") : "Account suspended by Super Admin.";

        companyVerificationService.suspendCompany(adminId, userId, reason);

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "success", true,
                "status", "SUSPENDED",
                "message", "Company account has been suspended."
        )));
    }

    @GetMapping("/company/{userId}/details")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCompanyVerificationDetails(@PathVariable UUID userId) {
        Map<String, Object> statusMap = companyVerificationService.getVerificationStatus(userId);
        List<com.beyon.profile.model.CompanyDocument> docs = companyDocumentRepository.findByUserIdOrderByCreatedAtDesc(userId.toString());
        List<com.beyon.profile.model.VerificationAuditLog> auditLogs = verificationAuditLogRepository.findByUserIdOrderByCreatedAtDesc(userId.toString());

        Map<String, Object> fullDetails = new LinkedHashMap<>(statusMap);
        fullDetails.put("documents", docs);
        fullDetails.put("auditLogs", auditLogs);

        return ResponseEntity.ok(ApiResponse.ok(fullDetails));
    }

    @GetMapping("/companies/verifications")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllCompanyVerifications() {
        List<com.beyon.profile.model.CompanyVerification> list = companyVerificationRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> result = new ArrayList<>();

        for (com.beyon.profile.model.CompanyVerification v : list) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", v.getId());
            m.put("userId", v.getUserId());
            m.put("companyId", v.getCompanyId());
            m.put("legalName", v.getLegalName());
            m.put("cin", v.getCin());
            m.put("companyStatus", v.getCompanyStatus());
            m.put("website", v.getOfficialWebsite());
            m.put("websiteDomain", v.getNormalizedWebsiteDomain());
            m.put("corporateEmail", v.getCorporateEmail());
            m.put("emailDomain", v.getNormalizedEmailDomain());
            m.put("representativeName", v.getRepresentativeName());
            m.put("representativeDesignation", v.getRepresentativeDesignation());
            m.put("representativePhone", v.getRepresentativePhone());
            m.put("overallStatus", v.getOverallStatus());
            m.put("failureReasons", v.getFailureReasons());
            m.put("reviewNotes", v.getReviewNotes());
            m.put("reviewedBy", v.getReviewedBy());
            m.put("reviewedAt", v.getReviewedAt());
            m.put("createdAt", v.getCreatedAt());

            List<com.beyon.profile.model.CompanyVerificationCheck> checks =
                    companyVerificationCheckRepository.findByVerificationIdOrderByCreatedAtAsc(v.getId());
            m.put("checks", checks);

            List<com.beyon.profile.model.CompanyDocument> docs =
                    companyDocumentRepository.findByUserIdOrderByCreatedAtDesc(v.getUserId());
            m.put("documents", docs);

            result.add(m);
        }

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/institution/{userId}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleInstitutionStatus(
            @PathVariable UUID userId,
            @RequestBody Map<String, String> body) {
        User user = resolveInstitutionUser(userId);
        String targetStatus = body.getOrDefault("status", "ACTIVE").toUpperCase();
        AccountStatus status = "DEACTIVATED".equals(targetStatus) ? AccountStatus.DEACTIVATED : AccountStatus.ACTIVE;
        user.setStatus(status);
        userRepository.save(user);

        auditService.log(AuditEventType.SUPER_ADMIN_APPROVAL, user.getEmail(), null,
                "Institution status updated to " + status.name() + ". Reason: " + body.getOrDefault("reason", "Admin status toggle"));

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "success", true,
                "userId", user.getId(),
                "status", status.name(),
                "message", "Institution account status updated to " + status.name()
        )));
    }

    @GetMapping("/institution-managers")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getInstitutionManagers() {
        List<User> managers = userRepository.findByRole(com.beyon.identity.enums.UserRole.INSTITUTION_MANAGER);
        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : managers) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getDisplayName());
            m.put("email", u.getEmail());
            m.put("status", u.getStatus().name());
            m.put("createdAt", u.getCreatedAt());
            result.add(m);
        }
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/institution-managers")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createInstitutionManager(
            @RequestBody Map<String, String> body) {
        String email = body.get("email").trim().toLowerCase();
        String name = body.get("name").trim();
        String tempPassword = body.getOrDefault("password", "Manager@2026!");

        User manager = userRepository.findByEmail(email).orElse(null);
        if (manager == null) {
            manager = new User();
            manager.setEmail(email);
            manager.setDisplayName(name);
            manager.setPasswordHash(passwordEncoder.encode(tempPassword));
            manager.setRole(com.beyon.identity.enums.UserRole.INSTITUTION_MANAGER);
            manager.setStatus(AccountStatus.ACTIVE);
            manager.setEmailVerified(true);
            manager.setMustChangePassword(false);
            manager = userRepository.save(manager);
        } else {
            manager.setDisplayName(name);
            manager.setRole(com.beyon.identity.enums.UserRole.INSTITUTION_MANAGER);
            manager.setStatus(AccountStatus.ACTIVE);
            manager.setPasswordHash(passwordEncoder.encode(tempPassword));
            userRepository.save(manager);
        }

        auditService.log(AuditEventType.SUPER_ADMIN_APPROVAL, manager.getEmail(), null,
                "Institution Manager account created for " + name + " (" + email + ")");

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "success", true,
                "id", manager.getId(),
                "name", manager.getDisplayName(),
                "email", manager.getEmail(),
                "role", manager.getRole().name(),
                "tempPassword", tempPassword,
                "message", "Institution Manager created and assigned successfully."
        )));
    }

    private User resolveInstitutionUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseGet(() -> {
                    try {
                        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                                "SELECT user_id FROM institution_profiles WHERE id = ? OR user_id = ?",
                                userId.toString(), userId.toString()
                        );
                        if (!rows.isEmpty()) {
                            Object uid = rows.get(0).get("user_id");
                            if (uid != null) {
                                UUID parsed = UUID.fromString(uid.toString());
                                return userRepository.findById(parsed).orElse(null);
                            }
                        }
                    } catch (Exception ignored) {}

                    try {
                        jdbcTemplate.update("DELETE FROM institution_profiles WHERE id = ? OR user_id = ?", userId.toString(), userId.toString());
                    } catch (Exception ignored) {}
                    throw new ResourceNotFoundException("Institution user account not found. Orphan record removed.");
                });
    }

    private User resolveCompanyUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseGet(() -> {
                    try {
                        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                                "SELECT user_id FROM company_profiles WHERE id = ? OR user_id = ?",
                                userId.toString(), userId.toString()
                        );
                        if (!rows.isEmpty()) {
                            Object uid = rows.get(0).get("user_id");
                            if (uid != null) {
                                UUID parsed = UUID.fromString(uid.toString());
                                return userRepository.findById(parsed).orElse(null);
                            }
                        }
                    } catch (Exception ignored) {}

                    try {
                        jdbcTemplate.update("DELETE FROM company_profiles WHERE id = ? OR user_id = ?", userId.toString(), userId.toString());
                    } catch (Exception ignored) {}
                    throw new ResourceNotFoundException("Company user account not found. Orphan record removed.");
                });
    }

    private UUID extractAdminUserId(Authentication auth) {
        if (auth != null && auth.getDetails() instanceof JwtUserDetails details) {
            try {
                return UUID.fromString(details.getUserId());
            } catch (Exception ignored) {}
        }
        return null;
    }
}

