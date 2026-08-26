package com.beyon.recruitment.service;

import com.beyon.recruitment.model.*;
import com.beyon.recruitment.repository.*;
import com.beyon.notification.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class PlacementVerificationService {

    private final PlacementVerificationRepository verifyRepo;
    private final PlacementRecordRepository recordRepo;
    private final InstitutionRatingRepository ratingRepo;
    private final NotificationService notificationService;

    public PlacementVerificationService(PlacementVerificationRepository verifyRepo,
                                         PlacementRecordRepository recordRepo,
                                         InstitutionRatingRepository ratingRepo,
                                         NotificationService notificationService) {
        this.verifyRepo = verifyRepo;
        this.recordRepo = recordRepo;
        this.ratingRepo = ratingRepo;
        this.notificationService = notificationService;
    }

    public PlacementVerification requestVerification(UUID placementRecordId, UUID studentId, String source) {
        PlacementRecord record = recordRepo.findById(placementRecordId)
            .orElseThrow(() -> new RuntimeException("Placement record not found"));
        if (!record.getStudentId().equals(studentId)) throw new RuntimeException("Forbidden");

        PlacementVerification verify = new PlacementVerification();
        verify.setPlacementRecordId(placementRecordId);
        verify.setStudentId(studentId);
        verify.setCompanyUserId(record.getCompanyUserId());
        verify.setInstitutionId(record.getInstitutionId());
        verify.setVerificationSource(source);
        return verifyRepo.save(verify);
    }

    public PlacementVerification companyVerify(UUID verificationId, UUID companyId) {
        PlacementVerification verify = verifyRepo.findById(verificationId)
            .orElseThrow(() -> new RuntimeException("Verification not found"));
        if (!verify.getCompanyUserId().equals(companyId)) throw new RuntimeException("Forbidden");
        verify.setVerificationStatus("COMPANY_VERIFIED");
        verify.setVerifiedBy(companyId);
        verify.setVerifiedAt(OffsetDateTime.now());
        verify.setUpdatedAt(OffsetDateTime.now());
        return verifyRepo.save(verify);
    }

    public PlacementVerification institutionVerify(UUID verificationId, UUID institutionId) {
        PlacementVerification verify = verifyRepo.findById(verificationId)
            .orElseThrow(() -> new RuntimeException("Verification not found"));
        verify.setVerificationStatus("INSTITUTION_VERIFIED");
        verify.setVerifiedBy(institutionId);
        verify.setVerifiedAt(OffsetDateTime.now());
        verify.setUpdatedAt(OffsetDateTime.now());
        return verifyRepo.save(verify);
    }

    public PlacementVerification studentConfirm(UUID verificationId, UUID studentId) {
        PlacementVerification verify = verifyRepo.findById(verificationId)
            .orElseThrow(() -> new RuntimeException("Verification not found"));
        if (!verify.getStudentId().equals(studentId)) throw new RuntimeException("Forbidden");

        // If already company or institution verified, mark as fully verified
        if ("COMPANY_VERIFIED".equals(verify.getVerificationStatus()) ||
            "INSTITUTION_VERIFIED".equals(verify.getVerificationStatus())) {
            verify.setVerificationStatus("VERIFIED");
            verify.setVerifiedAt(OffsetDateTime.now());

            // Update the placement record
            PlacementRecord record = recordRepo.findById(verify.getPlacementRecordId()).orElse(null);
            if (record != null) {
                record.setVerified(true);
                record.setVerifiedBy(verify.getVerifiedBy());
                record.setVerifiedAt(OffsetDateTime.now());
                record.setStatus("PLACED");
                record.setUpdatedAt(OffsetDateTime.now());
                recordRepo.save(record);
            }
            notificationService.send(verify.getStudentId(),
                "Placement Verified!", "Your placement has been verified.", "PLACEMENT_VERIFIED", "PLACEMENT", verify.getPlacementRecordId());
        } else {
            verify.setVerificationStatus("STUDENT_CONFIRMED");
        }
        verify.setUpdatedAt(OffsetDateTime.now());
        return verifyRepo.save(verify);
    }

    public PlacementVerification reject(UUID verificationId, UUID rejectedBy, String reason) {
        PlacementVerification verify = verifyRepo.findById(verificationId)
            .orElseThrow(() -> new RuntimeException("Verification not found"));
        verify.setVerificationStatus("REJECTED");
        verify.setRejectionReason(reason);
        verify.setVerifiedBy(rejectedBy);
        verify.setUpdatedAt(OffsetDateTime.now());
        notificationService.send(verify.getStudentId(),
            "Verification Rejected", "Reason: " + reason, "PLACEMENT_REJECTED", "PLACEMENT", verify.getPlacementRecordId());
        return verifyRepo.save(verify);
    }

    public List<PlacementVerification> getMyVerifications(UUID studentId) {
        return verifyRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<PlacementVerification> getPendingVerifications() {
        return verifyRepo.findByVerificationStatus("PENDING");
    }
}
