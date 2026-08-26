package com.beyon.community.repository;

import com.beyon.community.model.FeedbackReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FeedbackReportRepository extends JpaRepository<FeedbackReport, UUID> {
    List<FeedbackReport> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<FeedbackReport> findByReportNumber(Integer reportNumber);

    @Query("SELECT f FROM FeedbackReport f WHERE (:status IS NULL OR f.status = :status) AND (:category IS NULL OR f.category = :category) AND (:severity IS NULL OR f.systemSeverity = :severity) AND (:role IS NULL OR f.userRole = :role) AND (:search IS NULL OR LOWER(f.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(f.description) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY f.createdAt DESC")
    Page<FeedbackReport> findFiltered(@Param("status") String status, @Param("category") String category, @Param("severity") String severity, @Param("role") String role, @Param("search") String search, Pageable pageable);

    @Query("SELECT f.category, COUNT(f) FROM FeedbackReport f GROUP BY f.category ORDER BY COUNT(f) DESC")
    List<Object[]> countByCategoryGrouped();

    @Query("SELECT f.status, COUNT(f) FROM FeedbackReport f GROUP BY f.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT f.userRole, COUNT(f) FROM FeedbackReport f GROUP BY f.userRole")
    List<Object[]> countByRoleGrouped();

    @Query("SELECT f.applicationVersion, COUNT(f) FROM FeedbackReport f WHERE f.applicationVersion IS NOT NULL GROUP BY f.applicationVersion ORDER BY COUNT(f) DESC")
    List<Object[]> countByVersionGrouped();

    long countByStatus(String status);
    long countBySystemSeverity(String severity);

    List<FeedbackReport> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);
}
