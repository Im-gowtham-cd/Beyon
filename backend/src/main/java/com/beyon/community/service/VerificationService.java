package com.beyon.community.service;

import com.beyon.community.model.ProjectVerification;
import com.beyon.community.model.EntityVerification;
import com.beyon.community.repository.ProjectVerificationRepository;
import com.beyon.community.repository.EntityVerificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class VerificationService {
    private final ProjectVerificationRepository projectVerRepo;
    private final EntityVerificationRepository entityVerRepo;

    public VerificationService(ProjectVerificationRepository projectVerRepo, EntityVerificationRepository entityVerRepo) {
        this.projectVerRepo = projectVerRepo;
        this.entityVerRepo = entityVerRepo;
    }

    public ProjectVerification submitProjectVerification(UUID projectId, UUID studentId, String verificationType, String evidenceUrl) {
        ProjectVerification v = new ProjectVerification();
        v.setProjectId(projectId);
        v.setStudentId(studentId);
        v.setVerificationType(verificationType);
        v.setEvidenceUrl(evidenceUrl);
        v.setStatus("PENDING");
        return projectVerRepo.save(v);
    }

    public ProjectVerification verifyProject(UUID verificationId, UUID verifierId, String status) {
        ProjectVerification v = projectVerRepo.findById(verificationId).orElseThrow();
        v.setStatus(status);
        v.setVerifierId(verifierId);
        if ("VERIFIED".equals(status)) v.setVerifiedAt(OffsetDateTime.now());
        return projectVerRepo.save(v);
    }

    public List<ProjectVerification> getProjectVerifications(UUID projectId) {
        return projectVerRepo.findByProjectId(projectId);
    }

    public EntityVerification submitEntityVerification(UUID entityId, String entityType, String verificationType, String documentUrl) {
        EntityVerification v = new EntityVerification();
        v.setEntityId(entityId);
        v.setEntityType(entityType);
        v.setVerificationType(verificationType);
        v.setDocumentUrl(documentUrl);
        v.setStatus("PENDING");
        return entityVerRepo.save(v);
    }

    public EntityVerification verifyEntity(UUID verificationId, UUID verifierId, String status) {
        EntityVerification v = entityVerRepo.findById(verificationId).orElseThrow();
        v.setStatus(status);
        v.setVerifiedBy(verifierId);
        if ("VERIFIED".equals(status)) v.setVerifiedAt(OffsetDateTime.now());
        return entityVerRepo.save(v);
    }

    public boolean isEntityVerified(UUID entityId, String entityType) {
        return entityVerRepo.findByEntityIdAndEntityTypeAndStatus(entityId, entityType, "VERIFIED").isPresent();
    }
}
