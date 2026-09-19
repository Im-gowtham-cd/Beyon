package com.beyon.institution.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.institution.dto.*;
import com.beyon.institution.model.InstitutionDepartment;
import com.beyon.institution.service.InstitutionIntegrationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/institution")
public class InstitutionIntegrationController {

    private final InstitutionIntegrationService integrationService;

    public InstitutionIntegrationController(InstitutionIntegrationService integrationService) {
        this.integrationService = integrationService;
    }

    // 1. Authoritative AICTE Lookup
    @GetMapping("/onboard/validate-aicte")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateAicte(@RequestParam String aicteId) {
        return ResponseEntity.ok(ApiResponse.ok(integrationService.validateAicteId(aicteId)));
    }

    // 2. Institution Manager Initiates Onboarding
    @PostMapping("/onboard/initiate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> initiateOnboarding(
            @Valid @RequestBody InstitutionOnboardRequest request,
            Authentication auth,
            HttpServletRequest httpReq) {
        UUID userId = extractUserId(auth);
        String ip = httpReq.getRemoteAddr();
        String ua = httpReq.getHeader("User-Agent");
        return ResponseEntity.ok(ApiResponse.ok(integrationService.initiateOnboarding(request, userId, ip, ua)));
    }

    // 3. Principal Verifies OTP & Activates Institution
    @PostMapping("/onboard/verify-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request,
            HttpServletRequest httpReq) {
        String ip = httpReq.getRemoteAddr();
        String ua = httpReq.getHeader("User-Agent");
        return ResponseEntity.ok(ApiResponse.ok(integrationService.verifyPrincipalOtp(request, ip, ua)));
    }

    // 4. Principal Assigns Placement Coordinator
    @PostMapping("/hierarchy/placement-coordinator")
    public ResponseEntity<ApiResponse<Map<String, Object>>> assignPlacementCoordinator(
            @Valid @RequestBody PlacementCoordinatorRequest request,
            Authentication auth,
            HttpServletRequest httpReq) {
        UUID userId = extractUserId(auth);
        UUID instId = extractInstitutionId(auth);
        String ip = httpReq.getRemoteAddr();
        String ua = httpReq.getHeader("User-Agent");
        return ResponseEntity.ok(ApiResponse.ok(integrationService.assignPlacementCoordinator(userId, instId, request, ip, ua)));
    }

    // 5. Staff Roster for Institution
    @GetMapping("/hierarchy/staff")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStaffRoster(Authentication auth) {
        UUID instId = extractInstitutionId(auth);
        return ResponseEntity.ok(ApiResponse.ok(integrationService.getStaffRoster(instId)));
    }

    // 6. Departments Management
    @GetMapping("/hierarchy/departments")
    public ResponseEntity<ApiResponse<List<InstitutionDepartment>>> getDepartments(Authentication auth) {
        UUID instId = extractInstitutionId(auth);
        return ResponseEntity.ok(ApiResponse.ok(integrationService.getDepartments(instId)));
    }

    @PostMapping("/hierarchy/departments")
    public ResponseEntity<ApiResponse<InstitutionDepartment>> createDepartment(
            @Valid @RequestBody DepartmentRequest request,
            Authentication auth) {
        UUID userId = extractUserId(auth);
        UUID instId = extractInstitutionId(auth);
        return ResponseEntity.ok(ApiResponse.ok(integrationService.createDepartment(userId, instId, request)));
    }

    // 7. Coordinator Assigns Department In-Charge
    @PostMapping("/hierarchy/department-incharge")
    public ResponseEntity<ApiResponse<Map<String, Object>>> assignDeptIncharge(
            @Valid @RequestBody DeptInchargeRequest request,
            Authentication auth,
            HttpServletRequest httpReq) {
        UUID userId = extractUserId(auth);
        UUID instId = extractInstitutionId(auth);
        String ip = httpReq.getRemoteAddr();
        String ua = httpReq.getHeader("User-Agent");
        return ResponseEntity.ok(ApiResponse.ok(integrationService.assignDeptIncharge(userId, instId, request, ip, ua)));
    }

    // 8. Department In-Charge Gets Strictly Department Students
    @GetMapping({"/hierarchy/department-students", "/hierarchy/students"})
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDepartmentStudents(
            @RequestParam(required = false) String department,
            Authentication auth) {
        UUID userId = extractUserId(auth);
        UUID instId = extractInstitutionId(auth);
        String dept = department != null ? department : extractDepartmentId(auth);
        if (dept == null) {
            dept = "CSE";
        }
        return ResponseEntity.ok(ApiResponse.ok(integrationService.getDepartmentStudents(userId, instId, dept)));
    }

    // 9. Campus-wide Students for Coordinator / Principal
    @GetMapping("/hierarchy/all-students")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllStudents(Authentication auth) {
        UUID userId = extractUserId(auth);
        UUID instId = extractInstitutionId(auth);
        return ResponseEntity.ok(ApiResponse.ok(integrationService.getAllInstitutionStudents(userId, instId)));
    }

    // 10. Department In-Charge Adds Students (Single & Bulk)
    @PostMapping("/hierarchy/students")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addStudents(
            @Valid @RequestBody List<AddStudentRequest> students,
            @RequestParam(required = false) String department,
            Authentication auth,
            HttpServletRequest httpReq) {
        UUID userId = extractUserId(auth);
        UUID instId = extractInstitutionId(auth);
        String dept = department != null ? department : extractDepartmentId(auth);
        if (dept == null && !students.isEmpty()) {
            dept = students.get(0).getDepartment();
        }
        String ip = httpReq.getRemoteAddr();
        String ua = httpReq.getHeader("User-Agent");
        return ResponseEntity.ok(ApiResponse.ok(integrationService.addStudents(userId, instId, dept, students, ip, ua)));
    }

    // 11. Department In-Charge Verifies Student Profile
    @PostMapping("/hierarchy/students/{studentId}/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyStudent(
            @PathVariable UUID studentId,
            @RequestBody Map<String, Object> body,
            @RequestParam(required = false) String department,
            Authentication auth) {
        UUID userId = extractUserId(auth);
        UUID instId = extractInstitutionId(auth);
        String dept = department != null ? department : extractDepartmentId(auth);
        boolean approved = Boolean.parseBoolean(String.valueOf(body.getOrDefault("approved", true)));
        String notes = (String) body.get("notes");
        return ResponseEntity.ok(ApiResponse.ok(integrationService.verifyStudentProfile(userId, instId, dept, studentId, approved, notes)));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }

    private UUID extractInstitutionId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        if (details.getInstitutionId() != null && !details.getInstitutionId().isBlank()) {
            return UUID.fromString(details.getInstitutionId());
        }
        return UUID.fromString(details.getUserId());
    }

    private String extractDepartmentId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return details.getDepartmentId();
    }
}
