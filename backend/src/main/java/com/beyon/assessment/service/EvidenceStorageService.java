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

@Service
public class EvidenceStorageService {

    private static final Logger log = LoggerFactory.getLogger(EvidenceStorageService.class);

    @Value("${beyon.proctoring.evidence-base-path:uploads/evidence}")
    private String evidenceBasePath;

    @Value("${beyon.proctoring.evidence-base-url:http://localhost:8085/api/v1/evidence}")
    private String evidenceBaseUrl;

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

            return "/api/v1/evidence/" + sessionDir + "/" + incidentDir + "/" + filename;
        } catch (IOException e) {
            log.error("Failed to store evidence frame: {}", e.getMessage());
            return null;
        }
    }

    public File resolveStoragePath(String relativeUrl) {

        String path = relativeUrl.replace("/api/v1/evidence/", "");
        return new File(evidenceBasePath + "/" + path);
    }
}

