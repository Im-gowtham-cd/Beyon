package com.beyon.community.service;

import com.beyon.community.model.*;
import com.beyon.community.repository.*;
import com.beyon.notification.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class TeamService {

    private final ProjectTeamRepository teamRepo;
    private final TeamMemberRepository memberRepo;
    private final NotificationService notificationService;

    public TeamService(ProjectTeamRepository teamRepo, TeamMemberRepository memberRepo, NotificationService notificationService) {
        this.teamRepo = teamRepo;
        this.memberRepo = memberRepo;
        this.notificationService = notificationService;
    }

    public ProjectTeam createTeam(UUID projectId, UUID leaderId, String name, String description, Integer maxMembers, String lookingFor) {
        ProjectTeam team = new ProjectTeam();
        team.setProjectId(projectId);
        team.setLeaderId(leaderId);
        team.setName(name);
        team.setDescription(description);
        team.setMaxMembers(maxMembers != null ? maxMembers : 4);
        team.setLookingFor(lookingFor);
        return teamRepo.save(team);
    }

    public TeamMember joinTeam(UUID teamId, UUID studentId, String role, String skillsBrought) {
        ProjectTeam team = teamRepo.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));
        if (team.getCurrentMembers() >= team.getMaxMembers()) throw new RuntimeException("Team is full");

        boolean alreadyMember = memberRepo.findByTeamId(teamId).stream()
            .anyMatch(m -> m.getStudentId().equals(studentId));
        if (alreadyMember) throw new RuntimeException("Already a member");

        TeamMember member = new TeamMember();
        member.setTeamId(teamId);
        member.setStudentId(studentId);
        member.setRole(role);
        member.setSkillsBrought(skillsBrought);
        member.setStatus("ACCEPTED");
        memberRepo.save(member);

        team.setCurrentMembers(team.getCurrentMembers() + 1);
        if (team.getCurrentMembers() >= team.getMaxMembers()) team.setStatus("COMPLETE");
        team.setUpdatedAt(OffsetDateTime.now());
        teamRepo.save(team);

        notificationService.send(team.getLeaderId(), "New team member", "Someone joined your team " + team.getName(), "TEAM_JOIN", "TEAM", teamId);
        return member;
    }

    public List<Map<String, Object>> getTeamMembers(UUID teamId) {
        return memberRepo.findByTeamId(teamId).stream().map(m -> {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("id", m.getId());
            r.put("studentId", m.getStudentId());
            r.put("role", m.getRole());
            r.put("skillsBrought", m.getSkillsBrought());
            r.put("status", m.getStatus());
            r.put("joinedAt", m.getJoinedAt());
            return r;
        }).toList();
    }

    public List<ProjectTeam> getProjectTeams(UUID projectId) {
        return teamRepo.findByProjectIdOrderByCreatedAtDesc(projectId);
    }

    public List<ProjectTeam> getOpenTeams() {
        return teamRepo.findByStatusOrderByCreatedAtDesc("FORMING");
    }
}
