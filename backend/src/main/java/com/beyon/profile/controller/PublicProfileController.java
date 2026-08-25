package com.beyon.profile.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.profile.model.*;
import com.beyon.profile.repository.*;
import com.beyon.profile.service.StudentProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/public")
public class PublicProfileController {

    private final StudentProfileService studentProfileService;
    private final StudentProfileRepository studentProfileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final StudentProjectRepository studentProjectRepository;
    private final StudentCertificationRepository studentCertificationRepository;
    private final StudentLinkRepository studentLinkRepository;

    public PublicProfileController(StudentProfileService studentProfileService,
                                    StudentProfileRepository studentProfileRepository,
                                    StudentSkillRepository studentSkillRepository,
                                    StudentProjectRepository studentProjectRepository,
                                    StudentCertificationRepository studentCertificationRepository,
                                    StudentLinkRepository studentLinkRepository) {
        this.studentProfileService = studentProfileService;
        this.studentProfileRepository = studentProfileRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.studentProjectRepository = studentProjectRepository;
        this.studentCertificationRepository = studentCertificationRepository;
        this.studentLinkRepository = studentLinkRepository;
    }

    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<PublicProfileResponse>> getPublicProfile(@PathVariable String username) {
        StudentProfile profile = studentProfileService.getPublicProfile(username);
        UUID userId = profile.getUserId();

        PublicProfileResponse response = new PublicProfileResponse();
        response.setProfile(profile);
        response.setSkills(studentSkillRepository.findByUserId(userId));
        response.setProjects(studentProjectRepository.findByUserId(userId));
        response.setCertifications(studentCertificationRepository.findByUserId(userId));
        response.setLinks(studentLinkRepository.findByUserId(userId));

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    public static class PublicProfileResponse {
        private StudentProfile profile;
        private List<StudentSkill> skills;
        private List<StudentProject> projects;
        private List<StudentCertification> certifications;
        private List<StudentLink> links;

        public StudentProfile getProfile() { return profile; }
        public void setProfile(StudentProfile profile) { this.profile = profile; }
        public List<StudentSkill> getSkills() { return skills; }
        public void setSkills(List<StudentSkill> skills) { this.skills = skills; }
        public List<StudentProject> getProjects() { return projects; }
        public void setProjects(List<StudentProject> projects) { this.projects = projects; }
        public List<StudentCertification> getCertifications() { return certifications; }
        public void setCertifications(List<StudentCertification> certifications) { this.certifications = certifications; }
        public List<StudentLink> getLinks() { return links; }
        public void setLinks(List<StudentLink> links) { this.links = links; }
    }
}
