package com.beyon.identity.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RateLimitService {

    private final StringRedisTemplate redisTemplate;

    public RateLimitService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean isRateLimited(String key, int maxAttempts, Duration window) {
        try {
            String count = redisTemplate.opsForValue().get(key);
            if (count == null) {
                redisTemplate.opsForValue().set(key, "1", window);
                return false;
            }

            int current = Integer.parseInt(count);
            if (current >= maxAttempts) {
                return true;
            }

            redisTemplate.opsForValue().increment(key);
            return false;
        } catch (Exception e) {
            // Gracefully pass through when Redis is offline in dev
            return false;
        }
    }

    public void reset(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception ignored) {
        }
    }
}
