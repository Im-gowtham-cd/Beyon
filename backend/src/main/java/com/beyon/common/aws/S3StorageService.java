package com.beyon.common.aws;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

@Service
public class S3StorageService {

    private static final Logger log = LoggerFactory.getLogger(S3StorageService.class);
    private final S3Client s3Client;

    @Value("${beyon.s3.default-bucket:beyon-documents}")
    private String defaultBucket;

    public S3StorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public void ensureBucketExists(String bucketName) {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
        } catch (NoSuchBucketException e) {
            log.info("Creating S3 bucket: {}", bucketName);
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
        } catch (Exception e) {
            log.warn("Unable to check/create bucket {}: {}", bucketName, e.getMessage());
        }
    }

    public String uploadFile(String bucketName, String key, byte[] content, String contentType) {
        String bucket = (bucketName != null && !bucketName.isBlank()) ? bucketName : defaultBucket;
        try {
            PutObjectRequest putReq = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(contentType != null ? contentType : "application/octet-stream")
                    .build();

            s3Client.putObject(putReq, RequestBody.fromBytes(content));
            log.info("Successfully uploaded object to s3://{}/{}", bucket, key);
            return String.format("s3://%s/%s", bucket, key);
        } catch (Exception e) {
            log.error("Failed to upload object to s3://{}/{}: {}", bucket, key, e.getMessage());
            throw new RuntimeException("S3 upload failed: " + e.getMessage(), e);
        }
    }

    public byte[] downloadFile(String bucketName, String key) {
        String bucket = (bucketName != null && !bucketName.isBlank()) ? bucketName : defaultBucket;
        try {
            GetObjectRequest getReq = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();

            return s3Client.getObjectAsBytes(getReq).asByteArray();
        } catch (Exception e) {
            log.error("Failed to download object from s3://{}/{}: {}", bucket, key, e.getMessage());
            throw new RuntimeException("S3 download failed: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String bucketName, String key) {
        String bucket = (bucketName != null && !bucketName.isBlank()) ? bucketName : defaultBucket;
        try {
            DeleteObjectRequest deleteReq = DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteReq);
            log.info("Deleted object s3://{}/{}", bucket, key);
        } catch (Exception e) {
            log.error("Failed to delete object s3://{}/{}: {}", bucket, key, e.getMessage());
        }
    }

    public boolean doesObjectExist(String bucketName, String key) {
        String bucket = (bucketName != null && !bucketName.isBlank()) ? bucketName : defaultBucket;
        try {
            s3Client.headObject(HeadObjectRequest.builder().bucket(bucket).key(key).build());
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}
