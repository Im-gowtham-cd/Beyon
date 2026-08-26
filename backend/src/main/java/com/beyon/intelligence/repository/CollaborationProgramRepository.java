package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.CollaborationProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CollaborationProgramRepository extends JpaRepository<CollaborationProgram, UUID> {
    List<CollaborationProgram> findByHostUserIdOrderByCreatedAtDesc(UUID hostUserId);
    List<CollaborationProgram> findByStatusAndProgramType(String status, String programType);
    List<CollaborationProgram> findByStatusIn(List<String> statuses);
}
