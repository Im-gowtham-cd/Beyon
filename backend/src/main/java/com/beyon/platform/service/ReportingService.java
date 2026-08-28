package com.beyon.platform.service;

import com.beyon.platform.model.PlatformReport;
import com.beyon.platform.repository.PlatformReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class ReportingService {

    private final PlatformReportRepository reportRepo;

    public ReportingService(PlatformReportRepository reportRepo) {
        this.reportRepo = reportRepo;
    }

    public PlatformReport requestReport(UUID userId, String type, String title, Map<String, Object> parameters, String format) {
        PlatformReport report = new PlatformReport();
        report.setUserId(userId);
        report.setReportType(type);
        report.setTitle(title);
        report.setFormat(format != null ? format : "PDF");
        try {
            report.setParameters(new com.fasterxml.jackson.databind.ObjectMapper().valueToTree(parameters).toString());
        } catch (Exception e) {
            report.setParameters("{}");
        }
        return reportRepo.save(report);
    }

    public PlatformReport completeReport(UUID reportId, String fileUrl) {
        PlatformReport report = reportRepo.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setGenerationStatus("COMPLETED");
        report.setFileUrl(fileUrl);
        report.setCompletedAt(OffsetDateTime.now());
        return reportRepo.save(report);
    }

    public List<PlatformReport> getMyReports(UUID userId) {
        return reportRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<PlatformReport> getPendingReports() {
        return reportRepo.findByGenerationStatusOrderByCreatedAtDesc("PENDING");
    }
}
