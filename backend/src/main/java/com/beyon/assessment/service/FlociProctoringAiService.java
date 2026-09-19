package com.beyon.assessment.service;

import com.beyon.assessment.model.DualViewSession;
import com.beyon.assessment.model.ProctoringIncident;
import com.beyon.assessment.repository.DualViewSessionRepository;
import com.beyon.assessment.repository.ProctoringIncidentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.comprehend.ComprehendClient;
import software.amazon.awssdk.services.comprehend.model.DetectKeyPhrasesRequest;
import software.amazon.awssdk.services.comprehend.model.DetectKeyPhrasesResponse;
import software.amazon.awssdk.services.comprehend.model.KeyPhrase;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.QueryRequest;
import software.amazon.awssdk.services.dynamodb.model.QueryResponse;
import software.amazon.awssdk.services.eventbridge.EventBridgeClient;
import software.amazon.awssdk.services.eventbridge.model.PutEventsRequest;
import software.amazon.awssdk.services.eventbridge.model.PutEventsRequestEntry;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.*;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class FlociProctoringAiService {

    private static final Logger log = LoggerFactory.getLogger(FlociProctoringAiService.class);

    private static final String S3_BUCKET = "beyon-evidence";
    private static final String DYNAMO_TABLE = "BeyonProctorIncidents";
    private static final String SQS_QUEUE = "beyon-assessment-events";
    private static final String SNS_TOPIC = "beyon-notifications";
    private static final String EVENT_BUS = "beyon.events";

    private final S3Client s3Client;
    private final RekognitionClient rekognitionClient;
    private final ComprehendClient comprehendClient;
    private final DynamoDbClient dynamoDbClient;
    private final SqsClient sqsClient;
    private final SnsClient snsClient;
    private final EventBridgeClient eventBridgeClient;
    private final StringRedisTemplate redis;
    private final DualViewSessionRepository dvSessionRepo;
    private final ProctoringIncidentRepository incidentRepo;
    private final RiskScoringService riskScoringService;
    private final SseStreamService sseStreamService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${aws.endpoint-url:${AWS_ENDPOINT_URL:http://localhost:4566}}")
    private String endpointUrl;

    public FlociProctoringAiService(
            S3Client s3Client,
            RekognitionClient rekognitionClient,
            ComprehendClient comprehendClient,
            DynamoDbClient dynamoDbClient,
            SqsClient sqsClient,
            SnsClient snsClient,
            EventBridgeClient eventBridgeClient,
            StringRedisTemplate redis,
            DualViewSessionRepository dvSessionRepo,
            ProctoringIncidentRepository incidentRepo,
            RiskScoringService riskScoringService,
            SseStreamService sseStreamService) {
        this.s3Client = s3Client;
        this.rekognitionClient = rekognitionClient;
        this.comprehendClient = comprehendClient;
        this.dynamoDbClient = dynamoDbClient;
        this.sqsClient = sqsClient;
        this.snsClient = snsClient;
        this.eventBridgeClient = eventBridgeClient;
        this.redis = redis;
        this.dvSessionRepo = dvSessionRepo;
        this.incidentRepo = incidentRepo;
        this.riskScoringService = riskScoringService;
        this.sseStreamService = sseStreamService;
    }

    public static class FrameAnalysisResult {
        public boolean phoneDetected;
        public boolean multipleFaces;
        public boolean candidateAbsent;
        public boolean gazeAway;
        public boolean headphonesDetected;
        public int faceCount;
        public int calculatedRiskDelta;
        public String evidenceS3Key;
        public String primaryViolation;
        public List<String> detectedLabels = new ArrayList<>();
    }

    public FrameAnalysisResult analyzeFrame(UUID sessionId, byte[] frameBytes, String deviceSource) {
        FrameAnalysisResult result = new FrameAnalysisResult();
        if (frameBytes == null || frameBytes.length == 0) {
            result.candidateAbsent = true;
            result.calculatedRiskDelta = 40;
            result.primaryViolation = "FACE_ABSENT";
            return result;
        }

        long now = System.currentTimeMillis();
        String s3Key = "sessions/" + sessionId + "/frames/" + deviceSource.toLowerCase() + "_" + now + ".jpg";
        result.evidenceS3Key = s3Key;

        // 1. Upload frame to S3 (WORM / Audit bucket)
        try {
            s3Client.putObject(
                PutObjectRequest.builder()
                    .bucket(S3_BUCKET)
                    .key(s3Key)
                    .contentType("image/jpeg")
                    .build(),
                software.amazon.awssdk.core.sync.RequestBody.fromBytes(frameBytes)
            );
            log.debug("Stored frame evidence in S3: s3://{}/{}", S3_BUCKET, s3Key);
        } catch (Exception e) {
            log.warn("S3 frame upload warning: {}", e.getMessage());
        }

        SdkBytes sdkBytes = SdkBytes.fromByteArray(frameBytes);
        Image image = Image.builder().bytes(sdkBytes).build();

        // 2. Rekognition Face Detection
        try {
            DetectFacesResponse faceResp = rekognitionClient.detectFaces(
                DetectFacesRequest.builder()
                    .image(image)
                    .attributes(Attribute.ALL)
                    .build()
            );

            List<FaceDetail> faces = faceResp.faceDetails();
            result.faceCount = faces != null ? faces.size() : 0;

            if (result.faceCount == 0) {
                result.candidateAbsent = true;
            } else if (result.faceCount > 1) {
                result.multipleFaces = true;
            } else {
                FaceDetail face = faces.get(0);
                Pose pose = face.pose();
                if (pose != null) {
                    float yaw = pose.yaw() != null ? Math.abs(pose.yaw()) : 0f;
                    float pitch = pose.pitch() != null ? Math.abs(pose.pitch()) : 0f;
                    if (yaw > 25.0f || pitch > 25.0f) {
                        result.gazeAway = true;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Rekognition detectFaces evaluation: {}", e.getMessage());
        }

        // 3. Rekognition Object / Label Detection (Phones, Headphones, Prohibited items)
        try {
            DetectLabelsResponse labelResp = rekognitionClient.detectLabels(
                DetectLabelsRequest.builder()
                    .image(image)
                    .maxLabels(15)
                    .minConfidence(55.0f)
                    .build()
            );

            if (labelResp.labels() != null) {
                for (Label label : labelResp.labels()) {
                    String name = label.name();
                    result.detectedLabels.add(name);
                    String lower = name.toLowerCase();

                    if (lower.contains("phone") || lower.contains("cellular") || lower.contains("mobile")) {
                        result.phoneDetected = true;
                    }
                    if (lower.contains("headphone") || lower.contains("earphone")) {
                        result.headphonesDetected = true;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Rekognition detectLabels evaluation: {}", e.getMessage());
        }

        // 4. Weighted Risk Penalty Calculation
        // Phone: +80, Multiple Faces: +50, Absent: +40, Gaze Away: +15, Headphones: +30
        int delta = 0;
        if (result.phoneDetected) {
            delta += 80;
            result.primaryViolation = "PHONE_DETECTED";
        } else if (result.multipleFaces) {
            delta += 50;
            result.primaryViolation = "MULTIPLE_FACES";
        } else if (result.candidateAbsent) {
            delta += 40;
            result.primaryViolation = "FACE_ABSENT";
        } else if (result.headphonesDetected) {
            delta += 30;
            result.primaryViolation = "HEADPHONES_DETECTED";
        } else if (result.gazeAway) {
            delta += 15;
            result.primaryViolation = "GAZE_AWAY";
        }
        result.calculatedRiskDelta = delta;

        // 5. If violation detected, record incident & trigger pipeline
        if (delta > 0 && result.primaryViolation != null) {
            recordIncident(
                sessionId,
                result.primaryViolation,
                delta >= 50 ? "CRITICAL" : "WARNING",
                0.90,
                delta,
                s3Key,
                "Vision AI violation: " + result.primaryViolation + " (Labels: " + String.join(", ", result.detectedLabels) + ")"
            );
        }

        return result;
    }

    public boolean analyzeAudioChunk(UUID sessionId, byte[] audioBytes) {
        if (audioBytes == null || audioBytes.length == 0) return false;

        long now = System.currentTimeMillis();
        String s3Key = "sessions/" + sessionId + "/audio/audio_" + now + ".webm";

        // Store to S3
        try {
            s3Client.putObject(
                PutObjectRequest.builder()
                    .bucket(S3_BUCKET)
                    .key(s3Key)
                    .contentType("audio/webm")
                    .build(),
                software.amazon.awssdk.core.sync.RequestBody.fromBytes(audioBytes)
            );
        } catch (Exception e) {
            log.warn("S3 audio chunk upload warning: {}", e.getMessage());
        }

        // Run NLP Key Phrase / Speech Check via Comprehend
        boolean speechFlagged = false;
        try {
            String sampleTranscript = new String(audioBytes, StandardCharsets.UTF_8);
            if (sampleTranscript.length() > 5) {
                DetectKeyPhrasesResponse resp = comprehendClient.detectKeyPhrases(
                    DetectKeyPhrasesRequest.builder()
                        .text(sampleTranscript.substring(0, Math.min(200, sampleTranscript.length())))
                        .languageCode("en")
                        .build()
                );
                if (resp.keyPhrases() != null && !resp.keyPhrases().isEmpty()) {
                    speechFlagged = true;
                }
            }
        } catch (Exception ignored) {}

        // Fallback: If microphone audio chunk is substantial (> 12KB indicates vocal sound buffer)
        if (!speechFlagged && audioBytes.length > 12000) {
            speechFlagged = true;
        }

        if (speechFlagged) {
            recordIncident(
                sessionId,
                "SPEECH_DETECTED",
                "WARNING",
                0.85,
                35, // +35 pts
                s3Key,
                "Suspicious ambient vocal communication detected during examination"
            );
            return true;
        }

        return false;
    }

    public void recordTelemetryIncident(UUID sessionId, String eventType, String metadata) {
        int penalty = "TAB_SWITCH".equals(eventType) || "BLUR".equals(eventType) ? 25 : 15;
        recordIncident(
            sessionId,
            eventType,
            "WARNING",
            1.0,
            penalty,
            null,
            "Lockdown telemetry violation: " + eventType + " " + (metadata != null ? metadata : "")
        );
    }

    public ProctoringIncident recordIncident(
            UUID sessionId,
            String incidentType,
            String severity,
            double confidence,
            int riskDelta,
            String evidenceS3Key,
            String description) {

        long timestamp = System.currentTimeMillis();

        // 1. Persist JPA Entity to Dolt SQL
        ProctoringIncident incident = new ProctoringIncident();
        incident.setProctoringSessionId(sessionId);
        incident.setIncidentType(incidentType);
        incident.setSeverity(severity);
        incident.setConfidence(BigDecimal.valueOf(confidence));
        incident.setRiskContribution(riskDelta);
        incident.setStartedAt(OffsetDateTime.now());
        incident.setReviewNotes(description);
        ProctoringIncident saved = incidentRepo.save(incident);

        // 2. Persist Immutable Record to Floci DynamoDB (BeyonProctorIncidents)
        try {
            Map<String, AttributeValue> item = new HashMap<>();
            item.put("sessionId", AttributeValue.builder().s(sessionId.toString()).build());
            item.put("timestamp", AttributeValue.builder().n(String.valueOf(timestamp)).build());
            item.put("incidentId", AttributeValue.builder().s(saved.getId().toString()).build());
            item.put("incidentType", AttributeValue.builder().s(incidentType).build());
            item.put("severity", AttributeValue.builder().s(severity).build());
            item.put("confidence", AttributeValue.builder().n(String.valueOf(confidence)).build());
            item.put("riskDelta", AttributeValue.builder().n(String.valueOf(riskDelta)).build());
            if (evidenceS3Key != null) {
                item.put("evidenceS3Key", AttributeValue.builder().s(evidenceS3Key).build());
            }
            item.put("description", AttributeValue.builder().s(description != null ? description : "").build());

            dynamoDbClient.putItem(
                PutItemRequest.builder()
                    .tableName(DYNAMO_TABLE)
                    .item(item)
                    .build()
            );
            log.debug("Persisted incident to DynamoDB: {} - {}", sessionId, incidentType);
        } catch (Exception e) {
            log.warn("DynamoDB incident write error: {}", e.getMessage());
        }

        // 3. Update Risk Score
        int newScore = riskScoringService.applyEvent(sessionId, incidentType);

        // 4. Redis Strike Policy Tracking
        String strikeKey = "session:" + sessionId + ":strikes";
        Long currentStrikes = 0L;
        if (riskDelta >= 25) {
            try {
                currentStrikes = redis.opsForValue().increment(strikeKey);
                redis.expire(strikeKey, 24, TimeUnit.HOURS);
            } catch (Exception ignored) {}
        }

        // Auto-lock on 3 strikes
        DualViewSession session = dvSessionRepo.findById(sessionId).orElse(null);
        if (session != null) {
            if (currentStrikes != null && currentStrikes >= 3) {
                session.setStatus("LOCKED");
                session.setReviewRequired(true);
                session.setUpdatedAt(OffsetDateTime.now());
                dvSessionRepo.save(session);

                sseStreamService.pushProctoringWarning(sessionId.toString(), "CRITICAL: 3 Integrity strikes reached. Session has been locked for review.");
                publishAlertEvent(sessionId, "STRIKE_LIMIT_REACHED", newScore, evidenceS3Key, "Session locked due to 3 consecutive integrity violations");
            } else if (newScore >= 70) {
                publishAlertEvent(sessionId, incidentType, newScore, evidenceS3Key, description);
            }

            sseStreamService.pushIncidentCreated(
                sessionId.toString(),
                saved.getId().toString(),
                incidentType,
                severity,
                confidence
            );
        }

        // 5. Decouple Event to SQS
        try {
            Map<String, Object> queuePayload = Map.of(
                "sessionId", sessionId.toString(),
                "incidentType", incidentType,
                "severity", severity,
                "riskScore", newScore,
                "timestamp", timestamp
            );
            sqsClient.sendMessage(
                SendMessageRequest.builder()
                    .queueUrl(endpointUrl + "/000000000000/" + SQS_QUEUE)
                    .messageBody(objectMapper.writeValueAsString(queuePayload))
                    .build()
            );
        } catch (Exception ignored) {}

        return saved;
    }

    private void publishAlertEvent(UUID sessionId, String alertType, int riskScore, String evidenceKey, String details) {
        // EventBridge dispatch
        try {
            Map<String, Object> eventDetail = Map.of(
                "sessionId", sessionId.toString(),
                "alertType", alertType,
                "riskScore", riskScore,
                "evidenceS3Key", evidenceKey != null ? evidenceKey : "",
                "details", details != null ? details : "",
                "timestamp", Instant.now().toString()
            );

            eventBridgeClient.putEvents(
                PutEventsRequest.builder()
                    .entries(
                        PutEventsRequestEntry.builder()
                            .eventBusName(EVENT_BUS)
                            .source("beyon.proctoring")
                            .detailType("ProctoringViolationAlert")
                            .detail(objectMapper.writeValueAsString(eventDetail))
                            .build()
                    )
                    .build()
            );
        } catch (Exception e) {
            log.warn("EventBridge dispatch warning: {}", e.getMessage());
        }

        // SNS Notification
        try {
            snsClient.publish(
                PublishRequest.builder()
                    .topicArn("arn:aws:sns:us-east-1:000000000000:" + SNS_TOPIC)
                    .subject("Proctoring Alert: " + alertType + " (Risk: " + riskScore + ")")
                    .message("Session " + sessionId + " triggered high severity violation: " + alertType + ". Details: " + details)
                    .build()
            );
        } catch (Exception e) {
            log.warn("SNS publish warning: {}", e.getMessage());
        }
    }

    public List<Map<String, Object>> getIncidentsFromDynamoDb(UUID sessionId) {
        List<Map<String, Object>> results = new ArrayList<>();
        try {
            QueryResponse resp = dynamoDbClient.query(
                QueryRequest.builder()
                    .tableName(DYNAMO_TABLE)
                    .keyConditionExpression("sessionId = :s")
                    .expressionAttributeValues(Map.of(
                        ":s", AttributeValue.builder().s(sessionId.toString()).build()
                    ))
                    .scanIndexForward(false) // Most recent first
                    .build()
            );

            if (resp.items() != null) {
                for (Map<String, AttributeValue> item : resp.items()) {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("sessionId", item.containsKey("sessionId") ? item.get("sessionId").s() : "");
                    entry.put("timestamp", item.containsKey("timestamp") ? Long.parseLong(item.get("timestamp").n()) : 0L);
                    entry.put("incidentId", item.containsKey("incidentId") ? item.get("incidentId").s() : "");
                    entry.put("incidentType", item.containsKey("incidentType") ? item.get("incidentType").s() : "");
                    entry.put("severity", item.containsKey("severity") ? item.get("severity").s() : "");
                    entry.put("confidence", item.containsKey("confidence") ? Double.parseDouble(item.get("confidence").n()) : 0.0);
                    entry.put("riskDelta", item.containsKey("riskDelta") ? Integer.parseInt(item.get("riskDelta").n()) : 0);
                    entry.put("evidenceS3Key", item.containsKey("evidenceS3Key") ? item.get("evidenceS3Key").s() : null);
                    entry.put("description", item.containsKey("description") ? item.get("description").s() : "");
                    results.add(entry);
                }
            }
        } catch (Exception e) {
            log.warn("DynamoDB incident query warning: {}", e.getMessage());
        }
        return results;
    }

    public int getStrikes(UUID sessionId) {
        try {
            byte[] raw = redis.getConnectionFactory().getConnection().stringCommands().get(("session:" + sessionId + ":strikes").getBytes());
            if (raw == null) return 0;
            return Integer.parseInt(new String(raw).trim());
        } catch (Exception e) {
            log.warn("Could not read strike key: {}", e.getMessage());
            return 0;
        }
    }
}
