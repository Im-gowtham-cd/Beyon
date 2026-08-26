package com.beyon.intelligence.service;

import com.beyon.intelligence.model.*;
import com.beyon.intelligence.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class CollaborationService {

    private final CollaborationProgramRepository programRepo;
    private final CollaborationRegistrationRepository registrationRepo;
    private final StudentPortfolioItemRepository portfolioRepo;

    public CollaborationService(CollaborationProgramRepository programRepo, CollaborationRegistrationRepository registrationRepo,
                                StudentPortfolioItemRepository portfolioRepo) {
        this.programRepo = programRepo;
        this.registrationRepo = registrationRepo;
        this.portfolioRepo = portfolioRepo;
    }

    public CollaborationProgram createProgram(CollaborationProgram program) { return programRepo.save(program); }

    public CollaborationProgram publishProgram(UUID programId) {
        CollaborationProgram p = programRepo.findById(programId).orElseThrow(() -> new RuntimeException("Program not found"));
        p.setStatus("PUBLISHED");
        p.setUpdatedAt(OffsetDateTime.now());
        return programRepo.save(p);
    }

    public List<CollaborationProgram> getPublishedPrograms() {
        return programRepo.findByStatusIn(List.of("PUBLISHED", "OPEN", "IN_PROGRESS"));
    }

    public List<CollaborationProgram> getMyPrograms(UUID hostUserId) {
        return programRepo.findByHostUserIdOrderByCreatedAtDesc(hostUserId);
    }

    public CollaborationRegistration register(UUID programId, UUID userId) {
        Optional<CollaborationRegistration> existing = registrationRepo.findByProgramIdAndUserId(programId, userId);
        if (existing.isPresent()) throw new RuntimeException("Already registered");

        CollaborationProgram program = programRepo.findById(programId).orElseThrow(() -> new RuntimeException("Program not found"));
        if (program.getMaxParticipants() != null && program.getCurrentParticipants() >= program.getMaxParticipants()) {
            throw new RuntimeException("Program is full");
        }

        program.setCurrentParticipants(program.getCurrentParticipants() + 1);
        programRepo.save(program);

        CollaborationRegistration reg = new CollaborationRegistration();
        reg.setProgramId(programId);
        reg.setUserId(userId);
        return registrationRepo.save(reg);
    }

    public CollaborationRegistration completeProgram(UUID programId, UUID userId, String feedback, java.math.BigDecimal rating) {
        CollaborationRegistration reg = registrationRepo.findByProgramIdAndUserId(programId, userId)
                .orElseThrow(() -> new RuntimeException("Not registered"));
        reg.setStatus("COMPLETED");
        reg.setFeedback(feedback);
        reg.setRating(rating);
        reg.setCompletedAt(OffsetDateTime.now());

        CollaborationProgram program = programRepo.findById(programId).orElseThrow();
        if (program.getCertificateProvided()) {
            StudentPortfolioItem item = new StudentPortfolioItem();
            item.setStudentId(userId);
            item.setItemType("COLLABORATION");
            item.setTitle(program.getTitle());
            item.setDescription(program.getDescription());
            item.setOrganization(program.getHostType());
            item.setIssuedDate(java.time.LocalDate.now());
            item.setVerified(true);
            portfolioRepo.save(item);
        }

        return registrationRepo.save(reg);
    }

    public List<CollaborationRegistration> getMyRegistrations(UUID userId) {
        return registrationRepo.findByUserIdOrderByRegisteredAtDesc(userId);
    }

    public Map<String, Object> getProgramStats(UUID programId) {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalRegistrations", registrationRepo.countByProgramId(programId));
        List<CollaborationRegistration> regs = registrationRepo.findByProgramId(programId);
        stats.put("completed", regs.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count());
        stats.put("active", regs.stream().filter(r -> !"COMPLETED".equals(r.getStatus()) && !"CANCELLED".equals(r.getStatus())).count());
        return stats;
    }
}
