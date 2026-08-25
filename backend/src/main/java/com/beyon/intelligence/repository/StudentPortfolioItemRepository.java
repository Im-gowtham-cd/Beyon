package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.StudentPortfolioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StudentPortfolioItemRepository extends JpaRepository<StudentPortfolioItem, UUID> {
    List<StudentPortfolioItem> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<StudentPortfolioItem> findByStudentIdAndItemTypeOrderByCreatedAtDesc(UUID studentId, String itemType);
}
