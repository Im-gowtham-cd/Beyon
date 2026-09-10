package com.beyon.platform.aws;

import com.beyon.common.aws.AwsEventBridgePublisher;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.services.eventbridge.EventBridgeClient;
import software.amazon.awssdk.services.eventbridge.model.PutEventsRequest;
import software.amazon.awssdk.services.eventbridge.model.PutEventsResponse;
import software.amazon.awssdk.services.eventbridge.model.PutEventsResultEntry;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventBridgeCompatibilityTest {

    @Mock
    private EventBridgeClient eventBridgeClient;

    private AwsEventBridgePublisher publisher;

    @BeforeEach
    void setUp() {
        publisher = new AwsEventBridgePublisher(eventBridgeClient, new ObjectMapper());
    }

    @Test
    void testPublishEventSuccess() {
        PutEventsResponse response = PutEventsResponse.builder()
                .failedEntryCount(0)
                .entries(PutEventsResultEntry.builder().eventId("evt-001").build())
                .build();

        when(eventBridgeClient.putEvents(any(PutEventsRequest.class))).thenReturn(response);

        boolean success = publisher.publishEvent("AssessmentCompleted", "com.beyon.assessment", Map.of(
                "studentId", "stu-999",
                "score", 88.5
        ));

        assertTrue(success);
        verify(eventBridgeClient).putEvents(any(PutEventsRequest.class));
    }
}
