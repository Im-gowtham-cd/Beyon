package com.beyon.config.appwrite;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;

import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Service to manage user profile data in Appwrite TablesDB via REST API.
 */
public class AppwriteProfileService {

    private static final Logger log = LoggerFactory.getLogger(AppwriteProfileService.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    private final RestTemplate restTemplate;
    private final String endpoint;
    private final String projectId;
    private final String databaseId;
    private final String apiKey;

    // Appwrite database/collection IDs
    private static final String PROFILES_COLLECTION = "user_profiles";
    private static final String PREFERENCES_COLLECTION = "user_preferences";

    public AppwriteProfileService(RestTemplate restTemplate, String endpoint, String projectId, String databaseId, String apiKey) {
        this.restTemplate = restTemplate;
        this.endpoint = endpoint;
        this.projectId = projectId;
        this.databaseId = databaseId != null && !databaseId.isEmpty() ? databaseId : "6a8f0bbf00106d9d9dc0";
        this.apiKey = apiKey;
    }

    public AppwriteProfileService(RestTemplate restTemplate, String endpoint, String projectId, String apiKey) {
        this(restTemplate, endpoint, projectId, "6a8f0bbf00106d9d9dc0", apiKey);
    }

    private HttpHeaders serverHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Appwrite-Project", projectId);
        if (apiKey != null && !apiKey.isEmpty()) {
            headers.set("X-Appwrite-Key", apiKey);
        }
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    /**
     * Create or update a user profile document.
     */
    public void upsertProfile(String userId, Map<String, Object> profileData) {
        try {
            // Try to get existing
            HttpEntity<Void> getReq = new HttpEntity<>(serverHeaders());
            restTemplate.exchange(
                endpoint + "/databases/" + databaseId + "/collections/" + PROFILES_COLLECTION + "/documents/" + userId,
                HttpMethod.GET, getReq, String.class);
            // Update if exists
            updateDocument(PROFILES_COLLECTION, userId, profileData);
            log.info("Updated Appwrite profile for user: {}", userId);
        } catch (Exception e) {
            // Not found, create
            createDocument(PROFILES_COLLECTION, userId, profileData);
            log.info("Created Appwrite profile for user: {}", userId);
        }
    }

    /**
     * Get user profile from Appwrite.
     */
    public JsonNode getProfile(String userId) {
        try {
            HttpEntity<Void> request = new HttpEntity<>(serverHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                endpoint + "/databases/" + databaseId + "/collections/" + PROFILES_COLLECTION + "/documents/" + userId,
                HttpMethod.GET, request, String.class);
            return mapper.readTree(response.getBody());
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Create or update user preferences.
     */
    public void upsertPreferences(String userId, Map<String, Object> preferences) {
        try {
            HttpEntity<Void> getReq = new HttpEntity<>(serverHeaders());
            restTemplate.exchange(
                endpoint + "/databases/" + databaseId + "/collections/" + PREFERENCES_COLLECTION + "/documents/" + userId,
                HttpMethod.GET, getReq, String.class);
            updateDocument(PREFERENCES_COLLECTION, userId, preferences);
        } catch (Exception e) {
            createDocument(PREFERENCES_COLLECTION, userId, preferences);
        }
    }

    /**
     * Get user preferences.
     */
    public JsonNode getPreferences(String userId) {
        try {
            HttpEntity<Void> request = new HttpEntity<>(serverHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                endpoint + "/databases/" + databaseId + "/collections/" + PREFERENCES_COLLECTION + "/documents/" + userId,
                HttpMethod.GET, request, String.class);
            return mapper.readTree(response.getBody());
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Delete user profile.
     */
    public void deleteProfile(String userId) {
        try {
            HttpEntity<Void> request = new HttpEntity<>(serverHeaders());
            restTemplate.exchange(
                endpoint + "/databases/" + databaseId + "/collections/" + PROFILES_COLLECTION + "/documents/" + userId,
                HttpMethod.DELETE, request, Void.class);
        } catch (Exception e) {
            // Ignore
        }
    }

    private void createDocument(String collectionId, String documentId, Map<String, Object> data) {
        try {
            ObjectNode body = mapper.createObjectNode();
            body.put("documentId", documentId);
            ObjectNode dataNode = body.putObject("data");
            data.forEach((k, v) -> {
                if (v != null) {
                    dataNode.put(k, String.valueOf(v));
                }
            });

            HttpEntity<String> request = new HttpEntity<>(body.toString(), serverHeaders());
            restTemplate.exchange(
                endpoint + "/databases/" + databaseId + "/collections/" + collectionId + "/documents",
                HttpMethod.POST, request, String.class);
        } catch (Exception e) {
            log.error("Failed to create document in {}: {}", collectionId, e.getMessage());
        }
    }

    private void updateDocument(String collectionId, String documentId, Map<String, Object> data) {
        try {
            ObjectNode body = mapper.createObjectNode();
            ObjectNode dataNode = body.putObject("data");
            data.forEach((k, v) -> {
                if (v != null) {
                    dataNode.put(k, String.valueOf(v));
                }
            });

            HttpEntity<String> request = new HttpEntity<>(body.toString(), serverHeaders());
            restTemplate.exchange(
                endpoint + "/databases/" + databaseId + "/collections/" + collectionId + "/documents/" + documentId,
                HttpMethod.PUT, request, String.class);
        } catch (Exception e) {
            log.error("Failed to update document in {}: {}", collectionId, e.getMessage());
        }
    }
}
