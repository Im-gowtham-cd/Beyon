package com.beyon.platform.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {
    private final StringRedisTemplate redis;
    private final Map<String, RateLimitConfig> configs = new ConcurrentHashMap<>();

    public RateLimiterService(StringRedisTemplate redis) {
        this.redis = redis;
        configs.put("auth", new RateLimitConfig(5, 300));
        configs.put("api", new RateLimitConfig(100, 60));
        configs.put("assessment", new RateLimitConfig(30, 60));
        configs.put("social", new RateLimitConfig(30, 60));
    }

    public boolean isAllowed(String key, String limitType) {
        RateLimitConfig config = configs.getOrDefault(limitType, new RateLimitConfig(60, 60));
        String redisKey = "ratelimit:" + limitType + ":" + key;

        try {
            Long count = redis.opsForValue().increment(redisKey);
            if (count != null && count == 1) {
                redis.expire(redisKey, Duration.ofSeconds(config.windowSeconds));
            }
            return count == null || count <= config.maxRequests;
        } catch (Exception e) {
            return true;
        }
    }

    public void registerConfig(String type, int maxRequests, int windowSeconds) {
        configs.put(type, new RateLimitConfig(maxRequests, windowSeconds));
    }

    private static class RateLimitConfig {
        final int maxRequests;
        final int windowSeconds;
        RateLimitConfig(int maxRequests, int windowSeconds) {
            this.maxRequests = maxRequests;
            this.windowSeconds = windowSeconds;
        }
    }
}
