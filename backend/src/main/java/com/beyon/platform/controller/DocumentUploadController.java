package com.beyon.platform.controller;

import com.beyon.common.aws.S3StorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentUploadController {

    private static final Logger log = LoggerFactory.getLogger(DocumentUploadController.class);

    private final S3StorageService s3StorageService;

    @Value("${beyon.documents.storage-dir:uploads/documents}")
    private String storageDir;

    @Value("${beyon.s3.documents-bucket:beyon-documents}")
    private String documentsBucket;

    public DocumentUploadController(S3StorageService s3StorageService) {
        this.s3StorageService = s3StorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "STUDENT_ID_CARD") String category) {

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
            
            Path categoryDirPath = Paths.get(storageDir, cleanCategory);
            Files.createDirectories(categoryDirPath);
            Path targetPath = categoryDirPath.resolve(uniqueName);
            byte[] bytes = file.getBytes();
            Files.write(targetPath, bytes);

            String contentType = file.getContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = Files.probeContentType(targetPath);
                if (contentType == null) contentType = "application/octet-stream";
            }

            String s3Key = "documents/" + cleanCategory + "/" + uniqueName;
            String s3Url = null;
            try {
                s3StorageService.ensureBucketExists(documentsBucket);
                s3Url = s3StorageService.uploadFile(documentsBucket, s3Key, bytes, contentType);
            } catch (Exception s3Ex) {
                log.warn("Direct S3 upload fallback to local storage: {}", s3Ex.getMessage());
                s3Url = "s3://" + documentsBucket + "/" + s3Key;
            }

            String viewUrl = "/api/v1/documents/view/" + cleanCategory + "/" + uniqueName;

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
            log.error("Failed to store document", ex);
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
        String relativePath = uri.substring(idx + prefix.length());

        File file = Paths.get(storageDir, relativePath).toFile();
        if (!file.exists() || file.isDirectory()) {
            return ResponseEntity.notFound().build();
        }

        try {
            String contentType = Files.probeContentType(file.toPath());
            if (contentType == null) contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(new FileSystemResource(file));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
