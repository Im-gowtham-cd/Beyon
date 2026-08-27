package com.beyon.config.appwrite;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;

import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Service to interact with Appwrite Auth REST API.
 * Configured as a @Bean in AppwriteConfig.
 */
public class AppwriteAuthService {

    private static final Logger log = LoggerFactory.getLogger(AppwriteAuthService.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    private final RestTemplate restTemplate;
    private final String endpoint;
    private final String projectId;
    private final String apiKey;

    public AppwriteAuthService(RestTemplate restTemplate, String endpoint, String projectId, String apiKey) {
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
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    /**
     * Create a user in Appwrite (server-side with API key).
     */
    public String createUser(String email, String password, String name) {
        log.info("Creating Appwrite user: {}", email);
        try {
            ObjectNode body = mapper.createObjectNode();
            body.put("email", email);
            body.put("password", password);
            body.put("name", name);

            HttpEntity<String> request = new HttpEntity<>(body.toString(), serverHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                endpoint + "/users", HttpMethod.POST, request, String.class);

            JsonNode json = mapper.readTree(response.getBody());
            String userId = json.get("$id").asText();
            log.info("Appwrite user created: {}", userId);
            return userId;
        } catch (HttpClientErrorException.Conflict e) {
            log.warn("User already exists in Appwrite: {}", email);
            throw new RuntimeException("User already exists", e);
        } catch (HttpClientErrorException e) {
            log.error("Failed to create Appwrite user: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Appwrite user creation failed", e);
        } catch (Exception e) {
            log.error("Unexpected error creating Appwrite user: {}", email, e);
            throw new RuntimeException("Appwrite user creation failed", e);
        }
    }

    /**
     * Get user details by user ID.
     */
    public JsonNode getUser(String userId) {
        try {
            HttpEntity<Void> request = new HttpEntity<>(serverHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                endpoint + "/users/" + userId, HttpMethod.GET, request, String.class);
            return mapper.readTree(response.getBody());
        } catch (Exception e) {
            log.error("Failed to get Appwrite user: {}", userId);
            return null;
        }
    }

    /**
     * Get user by email.
     */
    public JsonNode getUserByEmail(String email) {
        try {
            HttpEntity<Void> request = new HttpEntity<>(serverHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                endpoint + "/users?email=" + email, HttpMethod.GET, request, String.class);
            JsonNode json = mapper.readTree(response.getBody());
            JsonNode users = json.get("users");
            if (users != null && users.isArray() && users.size() > 0) {
                return users.get(0);
            }
            return null;
        } catch (Exception e) {
            log.error("Failed to get Appwrite user by email: {}", email);
            return null;
        }
    }

    /**
     * Delete a user from Appwrite.
     */
    public void deleteUser(String userId) {
        log.warn("Deleting Appwrite user: {}", userId);
        try {
            HttpEntity<Void> request = new HttpEntity<>(serverHeaders());
            restTemplate.exchange(endpoint + "/users/" + userId, HttpMethod.DELETE, request, Void.class);
            log.info("Appwrite user deleted: {}", userId);
        } catch (Exception e) {
            log.error("Failed to delete Appwrite user: {}", userId, e);
        }
    }

    /**
     * Send password recovery email.
     */
    public void sendPasswordRecovery(String email, String redirectUrl) {
        try {
            ObjectNode body = mapper.createObjectNode();
            body.put("email", email);
            body.put("url", redirectUrl);

            HttpEntity<String> request = new HttpEntity<>(body.toString(), serverHeaders());
            restTemplate.exchange(endpoint + "/account/recovery", HttpMethod.POST, request, String.class);
            log.info("Password recovery sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password recovery: {}", e.getMessage());
        }
    }

    /**
     * Send email verification.
     */
    public void sendEmailVerification(String userId) {
        try {
            HttpEntity<Void> request = new HttpEntity<>(serverHeaders());
            restTemplate.exchange(endpoint + "/users/" + userId + "/verification", HttpMethod.POST, request, String.class);
        } catch (Exception e) {
            log.error("Failed to send email verification: {}", e.getMessage());
        }
    }

    public String getEndpoint() {
        return endpoint;
    }

    public String getProjectId() {
        return projectId;
    }
}
