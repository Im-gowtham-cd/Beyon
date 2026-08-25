package com.beyon.profile.repository;

import com.beyon.profile.model.StudentLink;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StudentLinkRepository extends JpaRepository<StudentLink, UUID> {
    List<StudentLink> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
