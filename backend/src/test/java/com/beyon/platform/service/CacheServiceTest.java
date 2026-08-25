package com.beyon.platform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CacheServiceTest {

    @Mock
    private StringRedisTemplate redis;

    @Mock
    private ValueOperations<String, String> valueOps;

    private CacheService cacheService;

    @BeforeEach
    void setUp() {
        cacheService = new CacheService(redis, new com.fasterxml.jackson.databind.ObjectMapper());
        lenient().when(redis.opsForValue()).thenReturn(valueOps);
    }

    @Test
    void getReturnsEmptyWhenKeyNotFound() {
        when(valueOps.get("missing-key")).thenReturn(null);
        Optional<String> result = cacheService.get("missing-key", String.class);
        assertTrue(result.isEmpty());
    }

    @Test
    void putSetsValueWithTTL() throws Exception {
        cacheService.put("test-key", "test-value", Duration.ofMinutes(5));
        verify(valueOps).set(eq("test-key"), anyString(), eq(Duration.ofMinutes(5)));
    }

    @Test
    void evictDeletesKey() {
        cacheService.evict("evict-key");
        verify(redis).delete("evict-key");
    }

    @Test
    void incrementReturnsIncrementedValue() {
        when(valueOps.increment("counter")).thenReturn(5L);
        long result = cacheService.increment("counter");
        assertEquals(5L, result);
    }

    @Test
    void acquireLockReturnsTrueOnSuccess() {
        when(valueOps.setIfAbsent("lock:123", "1", Duration.ofSeconds(30))).thenReturn(true);
        assertTrue(cacheService.acquireLock("lock:123", Duration.ofSeconds(30)));
    }

    @Test
    void acquireLockReturnsFalseWhenLocked() {
        when(valueOps.setIfAbsent("lock:123", "1", Duration.ofSeconds(30))).thenReturn(false);
        assertFalse(cacheService.acquireLock("lock:123", Duration.ofSeconds(30)));
    }
}
