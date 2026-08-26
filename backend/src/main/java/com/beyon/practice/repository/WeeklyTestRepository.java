package com.beyon.practice.repository;

import com.beyon.practice.model.WeeklyTest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WeeklyTestRepository extends JpaRepository<WeeklyTest, UUID> {
    List<WeeklyTest> findByStatusOrderByCreatedAtDesc(String status);
    Optional<WeeklyTest> findByWeekNumberAndYear(Integer weekNumber, Integer year);
    List<WeeklyTest> findTop5ByOrderByCreatedAtDesc();
}
