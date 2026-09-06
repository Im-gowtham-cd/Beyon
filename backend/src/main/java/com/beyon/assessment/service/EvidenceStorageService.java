package com.beyon.assessment.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

/**
 * Stores proctoring evidence frames (JPEG) on the local filesystem.
 * Files are served securely via /api/v1/evidence/{id} with authorization checks.
 */
@Service
public class EvidenceStorageService {

    private static final Logger log = LoggerFactory.getLogger(EvidenceStorageService.class);

    @Value("${beyon.proctoring.evidence-base-path:uploads/evidence}")
    private String evidenceBasePath;

    @Value("${beyon.proctoring.evidence-base-url:http://localhost:8085/api/v1/evidence}")
    private String evidenceBaseUrl;

    /**
     * Store a JPEG frame for an incident.
     * @return the public URL to access this evidence
     */
    public String storeFrame(UUID procSessionId, UUID incidentId, String deviceSource, byte[] imageBytes) {
        if (imageBytes == null || imageBytes.length == 0) return null;

        try {
            String sessionDir = procSessionId.toString();
            String incidentDir = incidentId.toString();
            File dir = new File(evidenceBasePath + "/" + sessionDir + "/" + incidentDir);
            dir.mkdirs();

            String filename = deviceSource.toLowerCase() + "_" + Instant.now().toEpochMilli() + ".jpg";
            File file = new File(dir, filename);

            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(imageBytes);
            }

            // Return relative URL path - served by EvidenceController
            return "/api/v1/evidence/" + sessionDir + "/" + incidentDir + "/" + filename;
        } catch (IOException e) {
            log.error("Failed to store evidence frame: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Resolve a relative storage URL to an absolute filesystem path.
     */
    public File resolveStoragePath(String relativeUrl) {
        // Strip /api/v1/evidence/ prefix
        String path = relativeUrl.replace("/api/v1/evidence/", "");
        return new File(evidenceBasePath + "/" + path);
    }
}
