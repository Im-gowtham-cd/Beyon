package com.beyon.community.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.community.model.ProjectTeam;
import com.beyon.community.model.TeamMember;
import com.beyon.community.service.TeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) { this.teamService = teamService; }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectTeam>> create(@RequestBody Map<String, Object> body, Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(teamService.createTeam(
            UUID.fromString((String) body.get("projectId")), studentId,
            (String) body.get("name"), (String) body.get("description"),
            body.get("maxMembers") != null ? Integer.parseInt(body.get("maxMembers").toString()) : 4,
            (String) body.get("lookingFor"))));
    }

    @PostMapping("/{teamId}/join")
    public ResponseEntity<ApiResponse<TeamMember>> join(@PathVariable UUID teamId, @RequestBody Map<String, String> body, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(teamService.joinTeam(teamId, extractUserId(auth), body.get("role"), body.get("skillsBrought"))));
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> members(@PathVariable UUID teamId) {
        return ResponseEntity.ok(ApiResponse.ok(teamService.getTeamMembers(teamId)));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<ProjectTeam>>> projectTeams(@PathVariable UUID projectId) {
        return ResponseEntity.ok(ApiResponse.ok(teamService.getProjectTeams(projectId)));
    }

    @GetMapping("/open")
    public ResponseEntity<ApiResponse<List<ProjectTeam>>> openTeams() {
        return ResponseEntity.ok(ApiResponse.ok(teamService.getOpenTeams()));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
