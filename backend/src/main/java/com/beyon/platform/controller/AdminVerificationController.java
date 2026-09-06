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

import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/verifications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminVerificationController {

    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;
    private final AuditService auditService;

    public AdminVerificationController(UserRepository userRepository,
                                       JdbcTemplate jdbcTemplate,
                                       AuditService auditService) {
        this.userRepository = userRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.auditService = auditService;
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
            @PathVariable UUID userId,
            @RequestBody(required = false) Map<String, String> body) {

        User user = resolveCompanyUser(userId);

        user.setStatus(AccountStatus.ACTIVE);
        user.setProfileStatus(AccountStatus.COMPLETED);
        userRepository.save(user);

        String notes = body != null ? body.getOrDefault("notes", "Approved by Super Admin") : "Approved by Super Admin";
        auditService.log(AuditEventType.SUPER_ADMIN_APPROVAL, user.getEmail(), null, notes);

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "success", true,
                "status", "ACTIVE",
                "message", "Company corporate registration verified and approved by Super Admin"
        )));
    }

    @PostMapping("/company/{userId}/reject")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rejectCompany(
            @PathVariable UUID userId,
            @RequestBody(required = false) Map<String, String> body) {

        User user = resolveCompanyUser(userId);

        user.setStatus(AccountStatus.REJECTED);
        user.setProfileStatus(AccountStatus.REJECTED);
        userRepository.save(user);

        String reason = body != null ? body.getOrDefault("reason", "Corporate credentials did not meet verification criteria") : "Rejected by Super Admin";
        auditService.log(AuditEventType.SUPER_ADMIN_REJECTION, user.getEmail(), null, reason);

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "success", true,
                "status", "REJECTED",
                "message", "Company registration rejected"
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
                    // Clean up orphan if user definitely deleted
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
                    // Clean up orphan if user definitely deleted
                    try {
                        jdbcTemplate.update("DELETE FROM company_profiles WHERE id = ? OR user_id = ?", userId.toString(), userId.toString());
                    } catch (Exception ignored) {}
                    throw new ResourceNotFoundException("Company user account not found. Orphan record removed.");
                });
    }
}
