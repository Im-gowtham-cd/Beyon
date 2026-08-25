package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.RecruitmentStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RecruitmentStatusHistoryRepository extends JpaRepository<RecruitmentStatusHistory, UUID> {
    List<RecruitmentStatusHistory> findByApplicationIdOrderByCreatedAtDesc(UUID applicationId);
}
