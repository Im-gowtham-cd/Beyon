package com.beyon.practice.repository;

import com.beyon.practice.model.Test;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TestRepository extends JpaRepository<Test, UUID> {
    List<Test> findByStatusOrderByStartTimeDesc(String status);
    List<Test> findByTestTypeAndStatus(String testType, String status);
}
