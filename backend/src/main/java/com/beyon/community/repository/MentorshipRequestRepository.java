package com.beyon.community.repository;

import com.beyon.community.model.MentorshipRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MentorshipRequestRepository extends JpaRepository<MentorshipRequest, UUID> {
    List<MentorshipRequest> findByStudentId(UUID studentId);
    List<MentorshipRequest> findByMentorId(UUID mentorId);
    List<MentorshipRequest> findByMentorIdAndStatus(UUID mentorId, String status);
}
