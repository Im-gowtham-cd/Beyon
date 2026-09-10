package com.beyon.platform.aws;

import com.beyon.platform.service.DoltVersionControlService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoltCompatibilityTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    private DoltVersionControlService doltService;

    @BeforeEach
    void setUp() {
        doltService = new DoltVersionControlService(jdbcTemplate);
    }

    @Test
    void testCreateBranch() {
        doNothing().when(jdbcTemplate).execute(anyString());
        boolean success = doltService.createBranch("industry-update-2026");
        assertTrue(success);
        verify(jdbcTemplate).execute("CALL DOLT_BRANCH('industry-update-2026')");
    }

    @Test
    void testCommitChanges() {
        doNothing().when(jdbcTemplate).execute(anyString());
        boolean success = doltService.commitChanges("Update required skills for Backend Engineer");
        assertTrue(success);
        verify(jdbcTemplate).execute("CALL DOLT_ADD('-A')");
        verify(jdbcTemplate).execute("CALL DOLT_COMMIT('-m', 'Update required skills for Backend Engineer')");
    }

    @Test
    void testGetCommitLog() {
        List<Map<String, Object>> mockLog = List.of(
                Map.of("commit_hash", "abc123", "message", "Initial schema", "committer", "beyon-admin")
        );
        when(jdbcTemplate.queryForList(anyString())).thenReturn(mockLog);

        List<Map<String, Object>> log = doltService.getCommitLog(5);
        assertNotNull(log);
        assertEquals(1, log.size());
        assertEquals("abc123", log.get(0).get("commit_hash"));
    }
}
