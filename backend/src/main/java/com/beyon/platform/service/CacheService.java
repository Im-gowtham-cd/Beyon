package com.beyon.platform.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Service
public class CacheService {
    private static final Logger log = LoggerFactory.getLogger(CacheService.class);
    private final StringRedisTemplate redis;
    private final ObjectMapper mapper;

    public CacheService(StringRedisTemplate redis, ObjectMapper mapper) {
        this.redis = redis;
        this.mapper = mapper;
    }

    public <T> Optional<T> get(String key, Class<T> type) {
        try {
            String value = redis.opsForValue().get(key);
            if (value != null) {
                return Optional.of(mapper.readValue(value, type));
            }
        } catch (Exception e) {
            log.warn("Cache read error for key {}: {}", key, e.getMessage());
        }
        return Optional.empty();
    }

    public <T> T getOrLoad(String key, Class<T> type, Duration ttl, Supplier<T> loader) {
        Optional<T> cached = get(key, type);
        if (cached.isPresent()) return cached.get();

        T value = loader.get();
        if (value != null) {
            put(key, value, ttl);
        }
        return value;
    }

    public <T> void put(String key, T value, Duration ttl) {
        try {
            String serialized = mapper.writeValueAsString(value);
            redis.opsForValue().set(key, serialized, ttl);
        } catch (Exception e) {
            log.warn("Cache write error for key {}: {}", key, e.getMessage());
        }
    }

    public void evict(String key) {
        try {
            redis.delete(key);
        } catch (Exception e) {
            log.warn("Cache eviction error for key {}: {}", key, e.getMessage());
        }
    }

    public void evictPattern(String pattern) {
        try {
            var keys = redis.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redis.delete(keys);
            }
        } catch (Exception e) {
            log.warn("Cache pattern eviction error: {}", e.getMessage());
        }
    }

    public boolean acquireLock(String lockKey, Duration timeout) {
        Boolean acquired = redis.opsForValue().setIfAbsent(lockKey, "1", timeout);
        return Boolean.TRUE.equals(acquired);
    }

    public void releaseLock(String lockKey) {
        redis.delete(lockKey);
    }

    public long increment(String key) {
        Long val = redis.opsForValue().increment(key);
        return val != null ? val : 0;
    }

    public void setWithExpiry(String key, String value, long ttlSeconds) {
        redis.opsForValue().set(key, value, ttlSeconds, TimeUnit.SECONDS);
    }
}
