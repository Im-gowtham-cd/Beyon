package com.beyon.config.appwrite;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * Appwrite REST API client configuration.
 * Uses RestTemplate (included in spring-boot-starter-web).
 * Since Appwrite has no official Java server SDK, we call REST API directly.
 */
@Configuration
public class AppwriteConfig {

    @Value("${beyon.appwrite.endpoint:https://sgp.cloud.appwrite.io/v1}")
    private String endpoint;

    @Value("${beyon.appwrite.project-id:6a8ebc22001ff0f8a815}")
    private String projectId;

    @Value("${beyon.appwrite.api-key:}")
    private String apiKey;

    @Bean
    public RestTemplate appwriteRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(30000);
        return new RestTemplate(factory);
    }

    @Bean
    public AppwriteAuthService appwriteAuthService(RestTemplate appwriteRestTemplate) {
        return new AppwriteAuthService(appwriteRestTemplate, endpoint, projectId, apiKey);
    }

    @Bean
    public AppwriteProfileService appwriteProfileService(RestTemplate appwriteRestTemplate) {
        return new AppwriteProfileService(appwriteRestTemplate, endpoint, projectId, apiKey);
    }

    @Bean
    public AppwriteStorageService appwriteStorageService(RestTemplate appwriteRestTemplate) {
        return new AppwriteStorageService(appwriteRestTemplate, endpoint, projectId, apiKey);
    }
}
