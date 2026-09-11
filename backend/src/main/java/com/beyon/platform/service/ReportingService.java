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
        report.setGenerationStatus("COMPLETED");
        report.setCompletedAt(OffsetDateTime.now());
        try {
            report.setParameters(new com.fasterxml.jackson.databind.ObjectMapper().valueToTree(parameters).toString());
        } catch (Exception e) {
            report.setParameters("{}");
        }
        report = reportRepo.save(report);
        report.setFileUrl("/api/v1/reports/" + report.getId() + "/download");
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

    public PlatformReport getById(UUID reportId) {
        return reportRepo.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));
    }

    public List<PlatformReport> getMyReports(UUID userId) {
        return reportRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<PlatformReport> getAllReports() {
        return reportRepo.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
    }

    public void deleteReport(UUID reportId) {
        reportRepo.deleteById(reportId);
    }

    public List<PlatformReport> getPendingReports() {
        return reportRepo.findByGenerationStatusOrderByCreatedAtDesc("PENDING");
    }
}

