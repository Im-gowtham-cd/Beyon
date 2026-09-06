package com.beyon.assessment.service;

import com.beyon.assessment.model.AssessmentSession;
import com.beyon.assessment.model.DualViewSession;
import com.beyon.assessment.repository.AssessmentSessionRepository;
import com.beyon.assessment.repository.DualViewSessionRepository;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.practice.model.CompanyOpportunity;
import com.beyon.practice.repository.CompanyOpportunityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired(required = false)
    private DualViewSessionRepository dvSessionRepo;

    @Autowired(required = false)
    private AssessmentSessionRepository assessmentSessionRepo;

    @Autowired(required = false)
    private UserRepository userRepo;

    @Autowired(required = false)
    private CompanyOpportunityRepository opportunityRepo;

    public String storeFrame(UUID procSessionId, UUID incidentId, String deviceSource, byte[] imageBytes) {
        return storeFrame(procSessionId, incidentId, deviceSource, imageBytes, null, null, null);
    }

    public String storeFrame(
            UUID procSessionId,
            UUID incidentId,
            String deviceSource,
            byte[] imageBytes,
            String testName,
            String studentName,
            String warningName) {
        if (imageBytes == null || imageBytes.length == 0) return null;

        try {
            if ((testName == null || testName.isBlank()) && procSessionId != null) {
                testName = resolveTestName(procSessionId);
            }
            if ((studentName == null || studentName.isBlank()) && procSessionId != null) {
                studentName = resolveStudentName(procSessionId);
            }

            String safeTestName = sanitizePathSegment(testName, "Assessment");
            String safeStudentName = sanitizePathSegment(studentName, "Student");
            String safeWarningName = sanitizePathSegment(
                    (warningName != null && !warningName.isBlank()) ? warningName : deviceSource,
                    "VIOLATION"
            );

            File baseDir = new File(evidenceBasePath);
            File testDir = new File(baseDir, safeTestName);
            File studentDir = new File(testDir, safeStudentName);

            if (!studentDir.exists()) {
                studentDir.mkdirs();
            }

            String filename = safeWarningName + "_" + Instant.now().toEpochMilli() + ".jpg";
            File file = new File(studentDir, filename);

            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(imageBytes);
            }

            log.info("Saved proctoring evidence frame to: {}", file.getAbsolutePath());
            return "/api/v1/evidence/" + safeTestName + "/" + safeStudentName + "/" + filename;
        } catch (IOException e) {
            log.error("Failed to store evidence frame: {}", e.getMessage());
            return null;
        }
    }

    public File resolveStoragePath(String relativeUrl) {
        if (relativeUrl == null) return new File(evidenceBasePath);
        String path = relativeUrl.replace("/api/v1/evidence/", "").replace("api/v1/evidence/", "");
        return new File(evidenceBasePath, path);
    }

    public String sanitizePathSegment(String input, String fallback) {
        if (input == null || input.isBlank()) return fallback;
        String cleaned = input.trim()
                .replaceAll("[\\\\/:*?\"<>|]", "_")
                .replaceAll("[\\s]+", "_")
                .replaceAll("[^a-zA-Z0-9_.-]", "_")
                .replaceAll("_+", "_")
                .replaceAll("^-+|-+$|^_+|_+$", "");
        return cleaned.isBlank() ? fallback : cleaned;
    }

    private String resolveTestName(UUID procSessionId) {
        try {
            if (dvSessionRepo != null) {
                DualViewSession dvs = dvSessionRepo.findById(procSessionId).orElse(null);
                if (dvs != null) {
                    if (dvs.getOpportunityId() != null && opportunityRepo != null) {
                        CompanyOpportunity opp = opportunityRepo.findById(dvs.getOpportunityId()).orElse(null);
                        if (opp != null && opp.getTitle() != null && !opp.getTitle().isBlank()) {
                            return opp.getTitle();
                        }
                    }
                    if (dvs.getAssessmentSessionId() != null && assessmentSessionRepo != null) {
                        AssessmentSession as = assessmentSessionRepo.findById(dvs.getAssessmentSessionId()).orElse(null);
                        if (as != null && as.getOpportunityId() != null && opportunityRepo != null) {
                            CompanyOpportunity opp = opportunityRepo.findById(as.getOpportunityId()).orElse(null);
                            if (opp != null && opp.getTitle() != null && !opp.getTitle().isBlank()) {
                                return opp.getTitle();
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Could not auto-resolve test name for proctoring session {}: {}", procSessionId, e.getMessage());
        }
        return "Assessment";
    }

    private String resolveStudentName(UUID procSessionId) {
        try {
            if (dvSessionRepo != null && userRepo != null) {
                DualViewSession dvs = dvSessionRepo.findById(procSessionId).orElse(null);
                if (dvs != null && dvs.getCandidateId() != null) {
                    User user = userRepo.findById(dvs.getCandidateId()).orElse(null);
                    if (user != null) {
                        if (user.getDisplayName() != null && !user.getDisplayName().isBlank()) {
                            return user.getDisplayName();
                        }
                        if (user.getEmail() != null && !user.getEmail().isBlank()) {
                            return user.getEmail();
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Could not auto-resolve student name for proctoring session {}: {}", procSessionId, e.getMessage());
        }
        return "Student";
    }
}

