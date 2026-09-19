package com.beyon.platform.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DoltVersionControlService {

    private static final Logger log = LoggerFactory.getLogger(DoltVersionControlService.class);
    private final JdbcTemplate jdbcTemplate;

    public DoltVersionControlService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean createBranch(String branchName) {
        try {
            jdbcTemplate.execute("CALL DOLT_BRANCH('" + sanitize(branchName) + "')");
            log.info("Dolt branch created: {}", branchName);
            return true;
        } catch (Exception e) {
            log.warn("Dolt branch creation failed for {}: {}", branchName, e.getMessage());
            return false;
        }
    }

    public boolean checkoutBranch(String branchName) {
        try {
            jdbcTemplate.execute("CALL DOLT_CHECKOUT('" + sanitize(branchName) + "')");
            log.info("Dolt checked out branch: {}", branchName);
            return true;
        } catch (Exception e) {
            log.warn("Dolt checkout failed for {}: {}", branchName, e.getMessage());
            return false;
        }
    }

    public boolean commitChanges(String message) {
        try {
            // Stage all changes
            jdbcTemplate.execute("CALL DOLT_ADD('-A')");
            // Commit
            jdbcTemplate.execute("CALL DOLT_COMMIT('-m', '" + sanitize(message) + "')");
            log.info("Dolt committed changes: {}", message);
            return true;
        } catch (Exception e) {
            log.warn("Dolt commit failed: {}", e.getMessage());
            return false;
        }
    }

    public List<Map<String, Object>> getCommitLog(int limit) {
        try {
            int l = limit > 0 ? limit : 10;
            return jdbcTemplate.queryForList("SELECT commit_hash, committer, message, date FROM dolt_log LIMIT " + l);
        } catch (Exception e) {
            log.warn("Failed to query dolt_log: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<Map<String, Object>> getDiff(String fromBranch, String toBranch, String tableName) {
        try {
            String sql = String.format(
                    "SELECT to_commit, from_commit, diff_type, to_%s_name, from_%s_name FROM DOLT_DIFF('%s', '%s', '%s')",
                    tableName.replace("s", ""), tableName.replace("s", ""),
                    sanitize(fromBranch), sanitize(toBranch), sanitize(tableName)
            );
            return jdbcTemplate.queryForList(sql);
        } catch (Exception e) {
            // Fallback generic diff query
            try {
                return jdbcTemplate.queryForList(String.format(
                        "SELECT * FROM DOLT_DIFF('%s', '%s', '%s') LIMIT 50",
                        sanitize(fromBranch), sanitize(toBranch), sanitize(tableName)
                ));
            } catch (Exception ex) {
                log.warn("Dolt diff query failed between {} and {}: {}", fromBranch, toBranch, ex.getMessage());
                return Collections.emptyList();
            }
        }
    }

    private String sanitize(String input) {
        if (input == null) return "";
        return input.replace("'", "").replace("\"", "").replace(";", "").replace("\\", "").trim();
    }
}
