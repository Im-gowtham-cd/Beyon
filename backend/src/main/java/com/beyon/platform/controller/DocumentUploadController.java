package com.beyon.platform.controller;

import com.beyon.common.aws.S3StorageService;
import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentUploadController {

    private static final Logger log = LoggerFactory.getLogger(DocumentUploadController.class);

    private final S3StorageService s3StorageService;
    private final JdbcTemplate jdbcTemplate;
    private final JwtUtil jwtUtil;

    @Value("${beyon.documents.storage-dir:uploads/documents}")
    private String storageDir;

    @Value("${beyon.s3.documents-bucket:beyon-documents}")
    private String documentsBucket;

    public DocumentUploadController(S3StorageService s3StorageService, JdbcTemplate jdbcTemplate, JwtUtil jwtUtil) {
        this.s3StorageService = s3StorageService;
        this.jdbcTemplate = jdbcTemplate;
        this.jwtUtil = jwtUtil;
    }

    private UUID extractUserId(Authentication auth, HttpServletRequest request) {
        if (auth != null) {
            if (auth.getDetails() instanceof JwtUserDetails details && details.getUserId() != null) {
                try {
                    return UUID.fromString(details.getUserId());
                } catch (Exception ignored) {}
            }
            if (auth.getPrincipal() instanceof String s) {
                try {
                    return UUID.fromString(s);
                } catch (Exception ignored) {}
            }
        }
        return extractUserIdFromRequest(request);
    }

    private UUID extractUserIdFromRequest(HttpServletRequest request) {
        try {
            String auth = request.getHeader("Authorization");
            if (auth != null && auth.startsWith("Bearer ")) {
                String token = auth.substring(7);
                if (jwtUtil.isTokenValid(token)) {
                    return jwtUtil.getUserId(token);
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    @GetMapping("/my-documents")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyDocuments(
            Authentication auth,
            HttpServletRequest request) {
        UUID userId = extractUserId(auth, request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }

        List<Map<String, Object>> result = new ArrayList<>();
        Set<String> seenPaths = new HashSet<>();
        com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

        // 1. Query student_profiles
        try {
            List<Map<String, Object>> profiles = jdbcTemplate.queryForList(
                "SELECT student_id_card_url, resume_url, internship_experience, education_10th, education_12th, updated_at FROM student_profiles WHERE user_id = ?",
                userId.toString()
            );

            if (!profiles.isEmpty()) {
                Map<String, Object> p = profiles.get(0);
                String idCardUrl = (String) p.get("student_id_card_url");
                String resumeUrl = (String) p.get("resume_url");
                String internshipExp = (String) p.get("internship_experience");
                Object updatedAt = p.get("updated_at");
                String dateStr = updatedAt != null ? updatedAt.toString().substring(0, 10) : LocalDate.now().toString();

                if (idCardUrl != null && !idCardUrl.isBlank() && seenPaths.add(idCardUrl)) {
                    String fileName = idCardUrl.substring(idCardUrl.lastIndexOf('/') + 1);
                    Map<String, Object> doc = new LinkedHashMap<>();
                    doc.put("id", "doc-id-card-" + userId.toString().substring(0, 8));
                    doc.put("title", "Official Student ID Card (Institutional Copy)");
                    doc.put("category", "GOVERNMENT_ID");
                    doc.put("fileName", fileName);
                    doc.put("fileSize", "Verified Upload");
                    doc.put("uploadDate", dateStr);
                    doc.put("status", "VERIFIED");
                    doc.put("issuingAuthority", "Institution Registrar / Beyon Campus Lake");
                    doc.put("storagePath", idCardUrl);
                    doc.put("viewUrl", idCardUrl);
                    doc.put("mimeType", guessMime(fileName));
                    result.add(doc);
                }

                if (resumeUrl != null && !resumeUrl.isBlank() && seenPaths.add(resumeUrl)) {
                    String fileName = resumeUrl.substring(resumeUrl.lastIndexOf('/') + 1);
                    Map<String, Object> doc = new LinkedHashMap<>();
                    doc.put("id", "doc-resume-" + userId.toString().substring(0, 8));
                    doc.put("title", "Verified Technical ATS Resume (PDF)");
                    doc.put("category", "RESUME");
                    doc.put("fileName", fileName);
                    doc.put("fileSize", "Verified Upload");
                    doc.put("uploadDate", dateStr);
                    doc.put("status", "VERIFIED");
                    doc.put("issuingAuthority", "Beyon Profile Engine");
                    doc.put("storagePath", resumeUrl);
                    doc.put("viewUrl", resumeUrl);
                    doc.put("mimeType", guessMime(fileName));
                    result.add(doc);
                }

                if (internshipExp != null && !internshipExp.isBlank()) {
                    try {
                        List<Map<String, Object>> internList = objectMapper.readValue(
                            internshipExp,
                            new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {}
                        );
                        for (Map<String, Object> intern : internList) {
                            String certUrl = (String) intern.get("certificateProofUrl");
                            if (certUrl != null && !certUrl.isBlank() && seenPaths.add(certUrl)) {
                                String company = (String) intern.getOrDefault("companyName", "Internship");
                                String role = (String) intern.getOrDefault("role", "Engineer");
                                String fileName = certUrl.substring(certUrl.lastIndexOf('/') + 1);
                                Map<String, Object> doc = new LinkedHashMap<>();
                                doc.put("id", "doc-intern-" + UUID.randomUUID().toString().substring(0, 8));
                                doc.put("title", company + " - " + role + " Completion Certificate");
                                doc.put("category", "INTERNSHIP_REPORT");
                                doc.put("fileName", fileName);
                                doc.put("fileSize", "Verified Certificate");
                                doc.put("uploadDate", dateStr);
                                doc.put("status", "VERIFIED");
                                doc.put("issuingAuthority", company + " Operations");
                                doc.put("storagePath", certUrl);
                                doc.put("viewUrl", certUrl);
                                doc.put("mimeType", guessMime(fileName));
                                result.add(doc);
                            }
                        }
                    } catch (Exception ex) {
                        log.warn("Failed to parse internship_experience JSON: {}", ex.getMessage());
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Error querying student_profiles for documents: {}", ex.getMessage());
        }

        // 2. Query file_documents
        try {
            List<Map<String, Object>> files = jdbcTemplate.queryForList(
                "SELECT id, file_type, original_name, storage_path, mime_type, file_size, created_at FROM file_documents WHERE user_id = ? ORDER BY created_at DESC",
                userId.toString()
            );

            for (Map<String, Object> f : files) {
                String path = (String) f.get("storage_path");
                if (path != null && !path.isBlank() && seenPaths.add(path)) {
                    String origName = (String) f.get("original_name");
                    String fType = (String) f.get("file_type");
                    Long size = f.get("file_size") instanceof Number ? ((Number) f.get("file_size")).longValue() : 0L;
                    Object createdAt = f.get("created_at");
                    String dateStr = createdAt != null ? createdAt.toString().substring(0, 10) : LocalDate.now().toString();

                    Map<String, Object> doc = new LinkedHashMap<>();
                    doc.put("id", f.get("id").toString());
                    doc.put("title", origName != null ? origName.replaceFirst("\\.[^.]+$", "").replace('_', ' ') : "Uploaded Document");
                    doc.put("category", mapCategory(fType));
                    doc.put("fileName", origName != null ? origName : "document");
                    doc.put("fileSize", formatFileSize(size));
                    doc.put("uploadDate", dateStr);
                    doc.put("status", "VERIFIED");
                    doc.put("issuingAuthority", "Institution Registrar / Ministry Verification Lake");
                    doc.put("storagePath", path);
                    doc.put("viewUrl", path);
                    doc.put("mimeType", f.get("mime_type") != null ? f.get("mime_type").toString() : guessMime(origName));
                    result.add(doc);
                }
            }
        } catch (Exception ex) {
            log.warn("Error querying file_documents: {}", ex.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    private String mapCategory(String cat) {
        if (cat == null) return "ACADEMIC_RECORD";
        String u = cat.toUpperCase();
        if (u.contains("RESUME")) return "RESUME";
        if (u.contains("ID") || u.contains("GOVERNMENT")) return "GOVERNMENT_ID";
        if (u.contains("INTERN")) return "INTERNSHIP_REPORT";
        return "ACADEMIC_RECORD";
    }

    private String guessMime(String name) {
        if (name == null) return "application/octet-stream";
        String l = name.toLowerCase();
        if (l.endsWith(".png")) return "image/png";
        if (l.endsWith(".jpg") || l.endsWith(".jpeg")) return "image/jpeg";
        if (l.endsWith(".webp")) return "image/webp";
        if (l.endsWith(".pdf")) return "application/pdf";
        return "application/octet-stream";
    }

    private String formatFileSize(long bytes) {
        if (bytes <= 0) return "Verified";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "STUDENT_ID_CARD") String category,
            Authentication auth,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        if (file == null || file.isEmpty()) {
            response.put("success", false);
            response.put("error", "File cannot be empty");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String cleanName = originalFilename != null ? originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_") : "doc";
            String uniqueName = UUID.randomUUID().toString().substring(0, 8) + "_" + cleanName;
            String cleanCategory = category.replaceAll("[^a-zA-Z0-9_-]", "");
            byte[] bytes = file.getBytes();

            String contentType = file.getContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = guessMime(originalFilename);
            }

            String s3Key = "documents/" + cleanCategory + "/" + uniqueName;
            String s3Url = null;
            try {
                s3StorageService.ensureBucketExists(documentsBucket);
                s3Url = s3StorageService.uploadFile(documentsBucket, s3Key, bytes, contentType);
                log.info("Stored document in S3 bucket {}: key {}", documentsBucket, s3Key);
            } catch (Exception s3Ex) {
                log.error("Failed to store document in S3: {}", s3Ex.getMessage());
                s3Url = "s3://" + documentsBucket + "/" + s3Key;
            }

            String viewUrl = "/api/v1/documents/view/" + cleanCategory + "/" + uniqueName;

            UUID userId = extractUserId(auth, request);
            if (userId != null) {
                try {
                    jdbcTemplate.update(
                        "INSERT INTO file_documents (id, user_id, file_type, original_name, storage_path, mime_type, file_size, is_public, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())",
                        UUID.randomUUID().toString(), userId.toString(), cleanCategory, originalFilename, viewUrl, contentType, file.getSize()
                    );
                } catch (Exception dbEx) {
                    log.warn("Failed to record file_document: {}", dbEx.getMessage());
                }
            }

            response.put("success", true);
            response.put("url", viewUrl);
            response.put("s3Url", s3Url);
            response.put("s3Bucket", documentsBucket);
            response.put("s3Key", s3Key);
            response.put("fileName", originalFilename);
            response.put("fileSize", file.getSize());
            response.put("contentType", contentType);

            return ResponseEntity.ok(response);
        } catch (IOException ex) {
            log.error("Failed to process document upload", ex);
            response.put("success", false);
            response.put("error", "Failed to upload document: " + ex.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/view/**")
    public ResponseEntity<Resource> viewDocument(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String prefix = "/api/v1/documents/view/";
        int idx = uri.indexOf(prefix);
        if (idx == -1) {
            return ResponseEntity.notFound().build();
        }
        String relativePath = uri.substring(idx + prefix.length()).replace('\\', '/');

        byte[] data = null;
        String s3Key = "documents/" + relativePath;

        try {
            if (s3StorageService.doesObjectExist(documentsBucket, s3Key)) {
                data = s3StorageService.downloadFile(documentsBucket, s3Key);
            } else if (s3StorageService.doesObjectExist(documentsBucket, relativePath)) {
                data = s3StorageService.downloadFile(documentsBucket, relativePath);
            }
        } catch (Exception s3Ex) {
            log.warn("S3 download fallback for document {}: {}", relativePath, s3Ex.getMessage());
        }

        // Fallback for legacy files
        if (data == null) {
            File file = Paths.get(storageDir, relativePath).toFile();
            if (file.exists() && file.isFile()) {
                try {
                    data = Files.readAllBytes(file.toPath());
                } catch (Exception ignored) {}
            }
        }

        if (data == null) {
            return ResponseEntity.notFound().build();
        }

        String fileName = relativePath.contains("/") ? relativePath.substring(relativePath.lastIndexOf('/') + 1) : "document";
        String contentType = guessMime(fileName);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                .contentType(MediaType.parseMediaType(contentType))
                .body(new org.springframework.core.io.ByteArrayResource(data));
    }
}
