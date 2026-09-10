package com.beyon.common.aws;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.eventbridge.EventBridgeClient;
import software.amazon.awssdk.services.eventbridge.model.PutEventsRequest;
import software.amazon.awssdk.services.eventbridge.model.PutEventsRequestEntry;
import software.amazon.awssdk.services.eventbridge.model.PutEventsResponse;

import java.time.Instant;

@Service
public class AwsEventBridgePublisher {

    private static final Logger log = LoggerFactory.getLogger(AwsEventBridgePublisher.class);
    private final EventBridgeClient eventBridgeClient;
    private final ObjectMapper objectMapper;

    @Value("${beyon.eventbridge.bus:beyon.events}")
    private String eventBusName;

    public AwsEventBridgePublisher(EventBridgeClient eventBridgeClient, ObjectMapper objectMapper) {
        this.eventBridgeClient = eventBridgeClient;
        this.objectMapper = objectMapper;
    }

    public boolean publishEvent(String detailType, String source, Object detail) {
        try {
            String detailJson = objectMapper.writeValueAsString(detail);

            PutEventsRequestEntry entry = PutEventsRequestEntry.builder()
                    .eventBusName(eventBusName)
                    .source(source != null ? source : "com.beyon")
                    .detailType(detailType)
                    .detail(detailJson)
                    .time(Instant.now())
                    .build();

            PutEventsRequest request = PutEventsRequest.builder()
                    .entries(entry)
                    .build();

            PutEventsResponse response = eventBridgeClient.putEvents(request);
            if (response.failedEntryCount() > 0) {
                log.warn("Failed to publish EventBridge event {} to {}: {}", detailType, eventBusName, response.entries());
                return false;
            }

            log.info("Published EventBridge event: type={}, source={}, bus={}", detailType, source, eventBusName);
            return true;
        } catch (Exception e) {
            log.warn("Could not publish EventBridge event {}: {} (fallback enabled)", detailType, e.getMessage());
            return false;
        }
    }
}
