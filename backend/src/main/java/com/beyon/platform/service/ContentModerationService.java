package com.beyon.platform.service;

import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.platform.model.ContentReport;
import com.beyon.platform.repository.ContentReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ContentModerationService {

    private final ContentReportRepository reportRepo;
    private final UserRepository userRepo;

    public ContentModerationService(ContentReportRepository reportRepo, UserRepository userRepo) {
        this.reportRepo = reportRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public ContentReport reportContent(UUID reporterId, String targetType, UUID targetId,
                                         String reason, String description) {
        User reporter = userRepo.findById(reporterId).orElseThrow();
        ContentReport report = new ContentReport();
        report.setReporter(reporter);
        report.setTargetType(targetType);
        report.setTargetId(targetId);
        report.setReason(reason);
        report.setDescription(description);
        return reportRepo.save(report);
    }

    public List<ContentReport> getPendingReports() {
        return reportRepo.findByStatus("PENDING");
    }

    public List<ContentReport> getAllReports() {
        return reportRepo.findAll();
    }

    @Transactional
    public ContentReport reviewReport(UUID reportId, UUID moderatorId, String action, String notes) {
        ContentReport report = reportRepo.findById(reportId).orElseThrow();
        User moderator = userRepo.findById(moderatorId).orElseThrow();
        report.setReviewedBy(moderator);
        report.setReviewAction(action);
        report.setReviewNotes(notes);
        report.setStatus("REVIEWED");
        report.setReviewedAt(Instant.now());
        return reportRepo.save(report);
    }

    public List<ContentReport> getReportsByTarget(String targetType, UUID targetId) {
        return reportRepo.findByTargetTypeAndTargetId(targetType, targetId);
    }
}
