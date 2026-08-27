package com.beyon.config.appwrite;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Service to manage file storage in Appwrite via REST API.
 * Replaces Supabase Storage.
 */
public class AppwriteStorageService {

    private static final Logger log = LoggerFactory.getLogger(AppwriteStorageService.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    private final RestTemplate restTemplate;
    private final String endpoint;
    private final String projectId;
    private final String apiKey;

    // Bucket IDs
    public static final String BUCKET_AVATARS = "avatars";
    public static final String BUCKET_DOCUMENTS = "documents";
    public static final String BUCKET_CERTIFICATES = "certificates";
    public static final String BUCKET_PROJECTS = "projects";
    public static final String BUCKET_RESUMES = "resumes";

    public AppwriteStorageService(RestTemplate restTemplate, String endpoint, String projectId, String apiKey) {
        this.restTemplate = restTemplate;
        this.endpoint = endpoint;
        this.projectId = projectId;
        this.apiKey = apiKey;
    }

    private HttpHeaders serverHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Appwrite-Project", projectId);
        if (apiKey != null && !apiKey.isEmpty()) {
            headers.set("X-Appwrite-Key", apiKey);
        }
        return headers;
    }

    /**
     * Upload a file to an Appwrite storage bucket.
     */
    public String uploadFile(String bucketId, String fileId, MultipartFile file) throws IOException {
        log.info("Uploading file to bucket {}: {}", bucketId, file.getOriginalFilename());

        try {
            HttpHeaders headers = serverHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload";
                }
            });

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                endpoint + "/storage/buckets/" + bucketId + "/files",
                HttpMethod.POST, request, String.class);

            JsonNode json = mapper.readTree(response.getBody());
            String id = json.get("$id").asText();
            log.info("File uploaded: {}", id);
            return id;
        } catch (Exception e) {
            log.error("Failed to upload file to {}: {}", bucketId, e.getMessage());
            throw new IOException("File upload failed", e);
        }
    }

    /**
     * Get file view URL.
     */
    public String getFileUrl(String bucketId, String fileId) {
        return endpoint + "/storage/buckets/" + bucketId + "/files/" + fileId + "/view?project=" + projectId;
    }

    /**
     * Get file download URL.
     */
    public String getFileDownloadUrl(String bucketId, String fileId) {
        return endpoint + "/storage/buckets/" + bucketId + "/files/" + fileId + "/download?project=" + projectId;
    }

    /**
     * Delete a file.
     */
    public void deleteFile(String bucketId, String fileId) {
        log.warn("Deleting file: {}/{}", bucketId, fileId);
        try {
            HttpEntity<Void> request = new HttpEntity<>(serverHeaders());
            restTemplate.exchange(
                endpoint + "/storage/buckets/" + bucketId + "/files/" + fileId,
                HttpMethod.DELETE, request, Void.class);
        } catch (Exception e) {
            log.error("Failed to delete file: {}/{}", bucketId, fileId, e);
        }
    }

    /**
     * Get file details.
     */
    public JsonNode getFile(String bucketId, String fileId) {
        try {
            HttpEntity<Void> request = new HttpEntity<>(serverHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                endpoint + "/storage/buckets/" + bucketId + "/files/" + fileId,
                HttpMethod.GET, request, String.class);
            return mapper.readTree(response.getBody());
        } catch (Exception e) {
            return null;
        }
    }

    // Convenience methods

    public String uploadAvatar(String userId, MultipartFile file) throws IOException {
        return uploadFile(BUCKET_AVATARS, userId, file);
    }

    public String uploadResume(String userId, MultipartFile file) throws IOException {
        return uploadFile(BUCKET_RESUMES, userId + "-resume-" + System.currentTimeMillis(), file);
    }

    public String uploadCertificate(String userId, MultipartFile file) throws IOException {
        return uploadFile(BUCKET_CERTIFICATES, userId + "-cert-" + System.currentTimeMillis(), file);
    }

    public String uploadDocument(String userId, MultipartFile file) throws IOException {
        return uploadFile(BUCKET_DOCUMENTS, userId + "-doc-" + System.currentTimeMillis(), file);
    }

    public String uploadProjectFile(String userId, String projectId, MultipartFile file) throws IOException {
        return uploadFile(BUCKET_PROJECTS, userId + "-proj-" + projectId + "-" + System.currentTimeMillis(), file);
    }
}
