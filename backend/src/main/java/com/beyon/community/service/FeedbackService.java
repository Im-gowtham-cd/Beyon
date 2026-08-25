package com.beyon.community.service;

import com.beyon.common.exception.ForbiddenException;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.community.model.*;
import com.beyon.community.repository.*;
import com.beyon.community.service.SmartNotificationService;
import com.beyon.platform.service.CacheService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class FeedbackService {
    private final FeedbackReportRepository reportRepo;
    private final FeedbackAttachmentRepository attachmentRepo;
    private final FeedbackStatusHistoryRepository historyRepo;
    private final FeedbackInternalNoteRepository noteRepo;
    private final FeedbackUserCommentRepository commentRepo;
    private final SmartNotificationService notifService;
    private final CacheService cacheService;

    public FeedbackService(FeedbackReportRepository reportRepo, FeedbackAttachmentRepository attachmentRepo,
                           FeedbackStatusHistoryRepository historyRepo, FeedbackInternalNoteRepository noteRepo,
                           FeedbackUserCommentRepository commentRepo, SmartNotificationService notifService,
                           CacheService cacheService) {
        this.reportRepo = reportRepo;
        this.attachmentRepo = attachmentRepo;
        this.historyRepo = historyRepo;
        this.noteRepo = noteRepo;
        this.commentRepo = commentRepo;
        this.notifService = notifService;
        this.cacheService = cacheService;
    }

    public FeedbackReport submit(UUID userId, String userRole, String reportType, String category,
                                  String title, String description, String userPriority,
                                  String applicationVersion, String page, String browserInfo,
                                  String osInfo, String screenSize, String requestId,
                                  String desktopAppVersion, UUID assessmentSessionId) {
        FeedbackReport report = new FeedbackReport();
        report.setUserId(userId);
        report.setUserRole(userRole);
        report.setReportType(reportType);
        report.setCategory(category);
        report.setTitle(title);
        report.setDescription(description);
        report.setUserPriority(userPriority != null ? userPriority : "NORMAL");
        report.setApplicationVersion(applicationVersion);
        report.setPage(page);
        report.setBrowserInfo(browserInfo);
        report.setOsInfo(osInfo);
        report.setScreenSize(screenSize);
        report.setRequestId(requestId);
        report.setDesktopAppVersion(desktopAppVersion);
        report.setAssessmentSessionId(assessmentSessionId);
        report.setStatus("SUBMITTED");

        FeedbackReport saved = reportRepo.save(report);

        historyRepo.save(createHistory(saved.getId(), null, "SUBMITTED", userId, "Report submitted"));

        cacheService.evictPattern("feedback:stats:*");
        return saved;
    }

    public List<FeedbackReport> findSimilar(String title, String description) {
        return reportRepo.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(title, description)
            .stream().limit(5).collect(Collectors.toList());
    }

    public FeedbackReport getById(UUID reportId) {
        return reportRepo.findById(reportId).orElseThrow(() -> new ResourceNotFoundException("Feedback report", reportId.toString()));
    }

    public FeedbackReport getByIdForUser(UUID reportId, UUID userId) {
        FeedbackReport report = getById(reportId);
        if (!report.getUserId().equals(userId)) throw new ForbiddenException("You can only view your own reports");
        return report;
    }

    public List<FeedbackReport> getMyReports(UUID userId) {
        return reportRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void addComment(UUID reportId, UUID userId, String content) {
        FeedbackReport report = getById(reportId);
        if (!report.getUserId().equals(userId)) throw new ForbiddenException("You can only comment on your own reports");

        FeedbackUserComment comment = new FeedbackUserComment();
        comment.setReportId(reportId);
        comment.setAuthorId(userId);
        comment.setContent(content);
        commentRepo.save(comment);
    }

    public List<FeedbackUserComment> getComments(UUID reportId) {
        return commentRepo.findByReportIdOrderByCreatedAtAsc(reportId);
    }

    public Page<FeedbackReport> adminGetAll(String status, String category, String severity, String role, String search, int page, int size) {
        return reportRepo.findFiltered(status, category, severity, role, search, PageRequest.of(page, size));
    }

    public FeedbackReport adminUpdate(UUID reportId, String status, String severity, UUID assignedTo, UUID adminId) {
        FeedbackReport report = getById(reportId);
        String oldStatus = report.getStatus();

        if (status != null) {
            report.setStatus(status);
            historyRepo.save(createHistory(reportId, oldStatus, status, adminId, null));
            if ("RESOLVED".equals(status)) report.setResolvedAt(OffsetDateTime.now());

            notifService.send(report.getUserId(), "FEEDBACK_UPDATE", "NORMAL",
                "Report BEYON-" + report.getReportNumber() + " updated",
                "Your report has been moved to \"" + status + "\"",
                "/feedback/" + report.getId(), "FEEDBACK", report.getId());
        }
        if (severity != null) report.setSystemSeverity(severity);
        if (assignedTo != null) report.setAssignedTo(assignedTo);

        report.setUpdatedAt(OffsetDateTime.now());
        cacheService.evictPattern("feedback:stats:*");
        return reportRepo.save(report);
    }

    public void adminAddNote(UUID reportId, UUID adminId, String content) {
        FeedbackInternalNote note = new FeedbackInternalNote();
        note.setReportId(reportId);
        note.setAuthorId(adminId);
        note.setContent(content);
        noteRepo.save(note);
    }

    public List<FeedbackInternalNote> adminGetNotes(UUID reportId) {
        return noteRepo.findByReportIdOrderByCreatedAtAsc(reportId);
    }

    public List<FeedbackStatusHistory> getStatusHistory(UUID reportId) {
        return historyRepo.findByReportIdOrderByCreatedAtAsc(reportId);
    }

    public Map<String, Object> adminGetStats() {
        String cacheKey = "feedback:stats:dashboard";
        return cacheService.getOrLoad(cacheKey, Map.class, Duration.ofMinutes(5), () -> {
            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("total", reportRepo.count());
            stats.put("submitted", reportRepo.countByStatus("SUBMITTED"));
            stats.put("underReview", reportRepo.countByStatus("UNDER_REVIEW"));
            stats.put("investigating", reportRepo.countByStatus("INVESTIGATING"));
            stats.put("resolved", reportRepo.countByStatus("RESOLVED"));
            stats.put("closed", reportRepo.countByStatus("CLOSED"));
            stats.put("critical", reportRepo.countBySystemSeverity("S0"));
            stats.put("major", reportRepo.countBySystemSeverity("S1"));

            stats.put("byCategory", reportRepo.countByCategoryGrouped().stream()
                .collect(Collectors.toMap(r -> r[0], r -> r[1])));
            stats.put("byStatus", reportRepo.countByStatusGrouped().stream()
                .collect(Collectors.toMap(r -> r[0], r -> r[1])));
            stats.put("byRole", reportRepo.countByRoleGrouped().stream()
                .collect(Collectors.toMap(r -> r[0], r -> r[1])));
            stats.put("byVersion", reportRepo.countByVersionGrouped().stream()
                .collect(Collectors.toMap(r -> r[0], r -> r[1])));
            return stats;
        });
    }

    public void addAttachment(UUID reportId, UUID userId, String fileName, String fileType, long fileSize, String storagePath) {
        FeedbackAttachment att = new FeedbackAttachment();
        att.setReportId(reportId);
        att.setFileName(fileName);
        att.setFileType(fileType);
        att.setFileSize(fileSize);
        att.setStoragePath(storagePath);
        att.setUploadedBy(userId);
        attachmentRepo.save(att);
    }

    public List<FeedbackAttachment> getAttachments(UUID reportId) {
        return attachmentRepo.findByReportIdOrderByCreatedAt(reportId);
    }

    private FeedbackStatusHistory createHistory(UUID reportId, String oldStatus, String newStatus, UUID changedBy, String note) {
        FeedbackStatusHistory h = new FeedbackStatusHistory();
        h.setReportId(reportId);
        h.setOldStatus(oldStatus);
        h.setNewStatus(newStatus);
        h.setChangedBy(changedBy);
        h.setNote(note);
        return h;
    }
}
