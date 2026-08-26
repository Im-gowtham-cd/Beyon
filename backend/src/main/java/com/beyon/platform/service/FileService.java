package com.beyon.platform.service;

import com.beyon.common.exception.BusinessException;
import com.beyon.common.exception.ForbiddenException;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.platform.model.FileDocument;
import com.beyon.platform.repository.FileDocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Pattern;

@Service
@Transactional
public class FileService {
    private static final Logger log = LoggerFactory.getLogger(FileService.class);
    private final FileDocumentRepository fileRepo;
    private final AuditService auditService;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of(
        "RESUME", "CERTIFICATE", "PROFILE_PHOTO", "PROJECT_EVIDENCE",
        "ACADEMIC_RECORD", "INTERNSHIP_REPORT", "INSTITUTION_DOCUMENT",
        "COMPANY_DOCUMENT", "ACHIEVEMENT_EVIDENCE"
    );
    private static final Pattern SAFE_NAME = Pattern.compile("^[a-zA-Z0-9._\\-() ]+$");

    public FileService(FileDocumentRepository fileRepo, AuditService auditService) {
        this.fileRepo = fileRepo;
        this.auditService = auditService;
    }

    public FileDocument registerFile(UUID userId, String fileType, String originalName, String mimeType, long fileSize, String storagePath) {
        if (!ALLOWED_TYPES.contains(fileType)) {
            throw new BusinessException("Invalid file type: " + fileType);
        }
        if (fileSize > MAX_FILE_SIZE) {
            throw new BusinessException("File too large. Maximum size is 10MB");
        }
        if (originalName == null || !SAFE_NAME.matcher(originalName).matches()) {
            throw new BusinessException("Invalid file name");
        }

        FileDocument doc = new FileDocument();
        doc.setUserId(userId);
        doc.setFileType(fileType);
        doc.setOriginalName(originalName);
        doc.setMimeType(mimeType);
        doc.setFileSize(fileSize);
        doc.setStoragePath(storagePath);
        doc.setIsPublic(false);
        return fileRepo.save(doc);
    }

    public List<FileDocument> getUserFiles(UUID userId) {
        return fileRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<FileDocument> getUserFilesByType(UUID userId, String fileType) {
        return fileRepo.findByUserIdAndFileTypeOrderByCreatedAtDesc(userId, fileType);
    }

    public FileDocument getFile(UUID fileId) {
        return fileRepo.findById(fileId).orElseThrow(() -> new ResourceNotFoundException("File", fileId.toString()));
    }

    public void deleteFile(UUID fileId, UUID userId) {
        FileDocument doc = fileRepo.findById(fileId).orElseThrow(() -> new ResourceNotFoundException("File", fileId.toString()));
        if (!doc.getUserId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own files");
        }
        fileRepo.delete(doc);
    }

    public long getUserFileCount(UUID userId) {
        return fileRepo.countByUserId(userId);
    }
}
