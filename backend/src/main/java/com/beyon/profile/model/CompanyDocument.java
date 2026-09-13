package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "company_documents")
public class CompanyDocument {

    @Id
    @Column(columnDefinition = "varchar(36)")
    private String id;

    @Column(nullable = false, columnDefinition = "varchar(36)")
    private String companyId;

    @Column(nullable = false, columnDefinition = "varchar(36)")
    private String userId;

    @Column(nullable = false, length = 50)
    private String docType; // CERTIFICATE_OF_INCORPORATION, COMPANY_PAN, AUTHORIZATION_LETTER, BUSINESS_DOCUMENT

    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(name = "s3_bucket", nullable = false, length = 100)
    private String s3Bucket = "beyon-documents";

    @Column(name = "s3_key", nullable = false, length = 500)
    private String s3Key;

    @Column(nullable = false, length = 500)
    private String fileUrl;

    @Column(length = 100)
    private String mimeType;

    private Long fileSize;

    @Column(nullable = false, length = 30)
    private String verificationStatus = "PENDING"; // PENDING, VERIFIED, REJECTED

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public CompanyDocument() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getDocType() { return docType; }
    public void setDocType(String docType) { this.docType = docType; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getS3Bucket() { return s3Bucket; }
    public void setS3Bucket(String s3Bucket) { this.s3Bucket = s3Bucket; }
    public String getS3Key() { return s3Key; }
    public void setS3Key(String s3Key) { this.s3Key = s3Key; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
