package com.beyon.platform.aws;

import com.beyon.common.aws.S3StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class S3CompatibilityTest {

    @Mock
    private S3Client s3Client;

    private S3StorageService storageService;

    @BeforeEach
    void setUp() {
        storageService = new S3StorageService(s3Client);
    }

    @Test
    void testUploadFileSucceeds() {
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());

        String uri = storageService.uploadFile("beyon-documents", "resumes/student-123.pdf", "sample data".getBytes(), "application/pdf");
        assertNotNull(uri);
        assertEquals("s3://beyon-documents/resumes/student-123.pdf", uri);
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void testDownloadFileSucceeds() {
        byte[] expected = "file contents".getBytes();
        GetObjectResponse response = GetObjectResponse.builder().contentLength((long) expected.length).build();
        ResponseBytes<GetObjectResponse> responseBytes = ResponseBytes.fromByteArray(response, expected);

        when(s3Client.getObjectAsBytes(any(GetObjectRequest.class))).thenReturn(responseBytes);

        byte[] actual = storageService.downloadFile("beyon-documents", "certificates/cert-456.pdf");
        assertArrayEquals(expected, actual);
    }

    @Test
    void testDoesObjectExist() {
        when(s3Client.headObject(any(HeadObjectRequest.class))).thenReturn(HeadObjectResponse.builder().build());
        assertTrue(storageService.doesObjectExist("beyon-documents", "test.txt"));

        when(s3Client.headObject(any(HeadObjectRequest.class))).thenThrow(NoSuchKeyException.builder().build());
        assertFalse(storageService.doesObjectExist("beyon-documents", "nonexistent.txt"));
    }

    @Test
    void testDeleteFile() {
        when(s3Client.deleteObject(any(DeleteObjectRequest.class))).thenReturn(DeleteObjectResponse.builder().build());
        assertDoesNotThrow(() -> storageService.deleteFile("beyon-documents", "old-report.pdf"));
        verify(s3Client).deleteObject(any(DeleteObjectRequest.class));
    }
}
