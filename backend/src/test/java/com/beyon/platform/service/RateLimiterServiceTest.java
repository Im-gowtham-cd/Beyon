package com.beyon.platform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RateLimiterServiceTest {

    @Mock
    private StringRedisTemplate redis;

    @Mock
    private ValueOperations<String, String> valueOps;

    private RateLimiterService rateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiter = new RateLimiterService(redis);
        lenient().when(redis.opsForValue()).thenReturn(valueOps);
    }

    @Test
    void allowsRequestUnderLimit() {
        when(valueOps.increment("ratelimit:api:user-1")).thenReturn(1L);
        assertTrue(rateLimiter.isAllowed("user-1", "api"));
    }

    @Test
    void blocksRequestOverLimit() {
        when(valueOps.increment("ratelimit:auth:user-1")).thenReturn(6L);
        assertFalse(rateLimiter.isAllowed("user-1", "auth"));
    }

    @Test
    void setsExpiryOnFirstRequest() {
        when(valueOps.increment("ratelimit:api:user-2")).thenReturn(1L);
        rateLimiter.isAllowed("user-2", "api");
        verify(redis).expire("ratelimit:api:user-2", java.time.Duration.ofSeconds(60));
    }

    @Test
    void allowsByDefaultOnRedisFailure() {
        when(valueOps.increment(anyString())).thenThrow(new RuntimeException("Redis down"));
        assertTrue(rateLimiter.isAllowed("user-3", "api"));
    }
}
