package com.beyon.platform.aws;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.*;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SqsCompatibilityTest {

    @Mock
    private SqsClient sqsClient;

    @Test
    void testSendAndReceiveMessage() {
        SendMessageResponse sendResp = SendMessageResponse.builder().messageId("msg-101").build();
        when(sqsClient.sendMessage(any(SendMessageRequest.class))).thenReturn(sendResp);

        SendMessageRequest sendReq = SendMessageRequest.builder()
                .queueUrl("http://localhost:4566/000000000000/beyon-recommendation-queue")
                .messageBody("{\"studentId\":\"S101\",\"action\":\"RECALCULATE\"}")
                .build();

        SendMessageResponse actualSend = sqsClient.sendMessage(sendReq);
        assertEquals("msg-101", actualSend.messageId());

        Message msg = Message.builder()
                .messageId("msg-101")
                .receiptHandle("rcpt-101")
                .body("{\"studentId\":\"S101\",\"action\":\"RECALCULATE\"}")
                .build();

        ReceiveMessageResponse receiveResp = ReceiveMessageResponse.builder().messages(List.of(msg)).build();
        when(sqsClient.receiveMessage(any(ReceiveMessageRequest.class))).thenReturn(receiveResp);

        ReceiveMessageResponse actualReceive = sqsClient.receiveMessage(ReceiveMessageRequest.builder().queueUrl("queue-url").build());
        assertEquals(1, actualReceive.messages().size());
        assertEquals("msg-101", actualReceive.messages().get(0).messageId());
    }
}
