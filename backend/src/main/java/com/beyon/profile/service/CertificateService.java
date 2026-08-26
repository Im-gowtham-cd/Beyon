package com.beyon.profile.service;

import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.profile.model.StudentCertificate;
import com.beyon.profile.repository.StudentCertificateRepository;
import com.beyon.intelligence.model.LearningProgramEnrollment;
import com.beyon.intelligence.repository.LearningProgramEnrollmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class CertificateService {

    private final StudentCertificateRepository certRepo;
    private final LearningProgramEnrollmentRepository enrollmentRepo;

    public CertificateService(StudentCertificateRepository certRepo, LearningProgramEnrollmentRepository enrollmentRepo) {
        this.certRepo = certRepo;
        this.enrollmentRepo = enrollmentRepo;
    }

    @Transactional
    public StudentCertificate issueCertificate(UUID studentId, UUID programId, String studentName, String programName, String issuerName, Integer score, String skillsCovered) {
        if (certRepo.findByStudentIdAndProgramId(studentId, programId).isPresent()) {
            throw new RuntimeException("Certificate already issued");
        }
        String certificateId = "BYN-" + programName.replaceAll("[^A-Z0-9]", "").substring(0, Math.min(6, programName.replaceAll("[^A-Z0-9]", "").length()))
                + "-" + Calendar.getInstance().get(Calendar.YEAR) + "-"
                + String.format("%06d", new Random().nextInt(999999));
        StudentCertificate cert = new StudentCertificate();
        cert.setStudentId(studentId);
        cert.setProgramId(programId);
        cert.setCertificateId(certificateId);
        cert.setStudentName(studentName);
        cert.setProgramName(programName);
        cert.setIssuerName(issuerName);
        cert.setScore(score);
        cert.setSkillsCovered(skillsCovered);
        cert.setVerificationUrl("/verify/" + certificateId);
        return certRepo.save(cert);
    }

    public Map<String, Object> verifyCertificate(String certificateId) {
        StudentCertificate cert = certRepo.findByCertificateId(certificateId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("valid", true);
        result.put("studentName", cert.getStudentName());
        result.put("programName", cert.getProgramName());
        result.put("issuerName", cert.getIssuerName());
        result.put("score", cert.getScore());
        result.put("issueDate", cert.getIssueDate());
        result.put("skillsCovered", cert.getSkillsCovered());
        result.put("certificateId", cert.getCertificateId());
        return result;
    }

    public List<StudentCertificate> getStudentCertificates(UUID studentId) {
        return certRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public StudentCertificate getCertificate(UUID id) {
        return certRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
    }
}
