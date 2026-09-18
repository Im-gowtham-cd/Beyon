package com.beyon.profile.controller;

import com.beyon.common.aws.S3StorageService;
import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.profile.model.CompanyDocument;
import com.beyon.profile.model.McaCompanyMaster;
import com.beyon.profile.repository.CompanyDocumentRepository;
import com.beyon.profile.repository.McaCompanyMasterRepository;
import com.beyon.profile.service.CompanyVerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/v1/company/verification")
public class CompanyVerificationController {

    private final CompanyVerificationService verificationService;
    private final McaCompanyMasterRepository mcaRepo;
    private final CompanyDocumentRepository docRepo;
    private final S3StorageService s3StorageService;
    private final com.beyon.intelligence.client.AiIntelligenceClient aiIntelligenceClient;

    public CompanyVerificationController(
            CompanyVerificationService verificationService,
            McaCompanyMasterRepository mcaRepo,
            CompanyDocumentRepository docRepo,
            S3StorageService s3StorageService,
            com.beyon.intelligence.client.AiIntelligenceClient aiIntelligenceClient) {
        this.verificationService = verificationService;
        this.mcaRepo = mcaRepo;
        this.docRepo = docRepo;
        this.s3StorageService = s3StorageService;
        this.aiIntelligenceClient = aiIntelligenceClient;
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatus(Authentication auth) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(verificationService.getVerificationStatus(userId)));
    }

    @GetMapping("/mca/lookup/{cin}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> lookupCin(@PathVariable String cin) {
        String cleanCin = cin.trim().toUpperCase();
        boolean alreadyRegistered = verificationService.isCinAlreadyRegistered(cleanCin);
        Optional<McaCompanyMaster> opt = verificationService.findOrLookupMca(cleanCin);

        String knownName = opt.map(McaCompanyMaster::getCompanyName).orElse(null);
        String knownState = opt.map(McaCompanyMaster::getCompanyState).orElse(null);
        String knownAddress = opt.map(McaCompanyMaster::getCompanyAddress).orElse(null);

        // 1. Query AI Service with Google Search Grounding
        try {
            Map<String, Object> aiLookup = aiIntelligenceClient.lookupCinCompany(cleanCin, knownName, null, knownState);
            if (aiLookup != null && Boolean.TRUE.equals(aiLookup.get("verified"))) {
                Map<String, Object> data = new LinkedHashMap<>(aiLookup);
                data.put("found", true);
                data.put("verified", true);
                data.put("alreadyRegistered", alreadyRegistered);
                data.put("cin", cleanCin);
                if (data.get("companyName") == null && knownName != null) data.put("companyName", knownName);
                if (data.get("legalName") == null && knownName != null) data.put("legalName", knownName);
                if (data.get("state") == null && knownState != null) data.put("state", knownState);
                if (data.get("address") == null && knownAddress != null) data.put("address", knownAddress);
                return ResponseEntity.ok(ApiResponse.ok(data));
            }
        } catch (Exception ignored) {}

        // 2. Fallback to MCA dataset record if available
        if (opt.isPresent()) {
            McaCompanyMaster m = opt.get();
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("found", true);
            data.put("verified", true);
            data.put("alreadyRegistered", alreadyRegistered);
            data.put("cin", m.getCin());
            data.put("companyName", m.getCompanyName());
            data.put("legalName", m.getCompanyName());
            data.put("status", m.getCompanyStatus());
            data.put("state", m.getCompanyState());
            data.put("address", m.getCompanyAddress());
            data.put("registrationDate", m.getCompanyRegistrationDate());
            data.put("category", m.getCompanyCategory());
            data.put("class", m.getCompanyClass());
            data.put("officialWebsite", m.getOfficialWebsite());
            data.put("representativeName", "Talent Acquisition & HR Directorate (" + m.getCompanyName() + ")");
            data.put("authorizedCapital", m.getAuthorizedCapital());
            data.put("paidupCapital", m.getPaidupCapital());
            data.put("sourceUrls", List.of("https://www.mca.gov.in/mcafoportal/companyLLPMasterData.do"));
            data.put("missingFields", Collections.emptyList());
            data.put("confidenceScore", 0.95);
            return ResponseEntity.ok(ApiResponse.ok(data));
        } else {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("found", false);
            data.put("verified", false);
            data.put("alreadyRegistered", alreadyRegistered);
            data.put("message", "CIN not found in MCA company master database.");
            data.put("missingFields", List.of("companyName", "officialWebsite", "corporateEmail", "city", "state"));
            data.put("sourceUrls", Collections.emptyList());
            data.put("confidenceScore", 0.0);
            return ResponseEntity.ok(ApiResponse.ok(data));
        }
    }

    @PostMapping("/documents")
    public ResponseEntity<ApiResponse<CompanyDocument>> uploadDocument(
            Authentication auth,
            @RequestParam("file") MultipartFile file,
            @RequestParam("docType") String docType) {

        UUID userId = extractUserId(auth);
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty.");
        }

        try {
            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
            String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")) : ".pdf";
            String s3Key = "company-verifications/" + userId + "/" + UUID.randomUUID() + ext;

            s3StorageService.uploadFile("beyon-documents", s3Key, file.getBytes(), file.getContentType());
            String fileUrl = "/api/v1/s3/beyon-documents/" + s3Key;

            CompanyDocument doc = new CompanyDocument();
            doc.setId(UUID.randomUUID().toString());
            doc.setUserId(userId.toString());
            doc.setCompanyId(userId.toString());
            doc.setDocType(docType);
            doc.setFileName(originalName);
            doc.setS3Bucket("beyon-documents");
            doc.setS3Key(s3Key);
            doc.setFileUrl(fileUrl);
            doc.setMimeType(file.getContentType());
            doc.setFileSize(file.getSize());
            doc.setVerificationStatus("PENDING");

            CompanyDocument saved = docRepo.save(doc);
            return ResponseEntity.ok(ApiResponse.ok(saved));
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload document to secure storage: " + e.getMessage(), e);
        }
    }

    @GetMapping("/documents")
    public ResponseEntity<ApiResponse<List<CompanyDocument>>> getDocuments(Authentication auth) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(docRepo.findByUserIdOrderByCreatedAtDesc(userId.toString())));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
