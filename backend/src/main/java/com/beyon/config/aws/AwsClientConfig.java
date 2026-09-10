package com.beyon.config.aws;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.eventbridge.EventBridgeClient;
import software.amazon.awssdk.services.eventbridge.EventBridgeClientBuilder;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.SnsClientBuilder;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.SqsClientBuilder;

import java.net.URI;

@Configuration
public class AwsClientConfig {

    private static final Logger log = LoggerFactory.getLogger(AwsClientConfig.class);

    @Value("${aws.endpoint-url:${AWS_ENDPOINT_URL:}}")
    private String endpointUrl;

    @Value("${aws.region:${AWS_REGION:us-east-1}}")
    private String region;

    @Value("${aws.access-key-id:${AWS_ACCESS_KEY_ID:test}}")
    private String accessKey;

    @Value("${aws.secret-access-key:${AWS_SECRET_ACCESS_KEY:test}}")
    private String secretKey;

    private StaticCredentialsProvider credentialsProvider() {
        return StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey));
    }

    @Bean
    public S3Client s3Client() {
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider())
                .forcePathStyle(true); // Required for Floci/LocalStack path-style URLs

        if (endpointUrl != null && !endpointUrl.isBlank()) {
            log.info("Configuring S3Client with custom endpoint (Floci/Dev): {}", endpointUrl);
            builder.endpointOverride(URI.create(endpointUrl));
        } else {
            log.info("Configuring S3Client with default AWS regional endpoint ({})", region);
        }

        return builder.build();
    }

    @Bean
    public SqsClient sqsClient() {
        SqsClientBuilder builder = SqsClient.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider());

        if (endpointUrl != null && !endpointUrl.isBlank()) {
            log.info("Configuring SqsClient with custom endpoint: {}", endpointUrl);
            builder.endpointOverride(URI.create(endpointUrl));
        }

        return builder.build();
    }

    @Bean
    public SnsClient snsClient() {
        SnsClientBuilder builder = SnsClient.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider());

        if (endpointUrl != null && !endpointUrl.isBlank()) {
            log.info("Configuring SnsClient with custom endpoint: {}", endpointUrl);
            builder.endpointOverride(URI.create(endpointUrl));
        }

        return builder.build();
    }

    @Bean
    public EventBridgeClient eventBridgeClient() {
        EventBridgeClientBuilder builder = EventBridgeClient.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider());

        if (endpointUrl != null && !endpointUrl.isBlank()) {
            log.info("Configuring EventBridgeClient with custom endpoint: {}", endpointUrl);
            builder.endpointOverride(URI.create(endpointUrl));
        }

        return builder.build();
    }
}
