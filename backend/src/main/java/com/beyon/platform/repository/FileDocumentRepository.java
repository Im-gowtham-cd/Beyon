package com.beyon.platform.repository;

import com.beyon.platform.model.FileDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FileDocumentRepository extends JpaRepository<FileDocument, UUID> {
    List<FileDocument> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<FileDocument> findByUserIdAndFileTypeOrderByCreatedAtDesc(UUID userId, String fileType);
    long countByUserId(UUID userId);
}
