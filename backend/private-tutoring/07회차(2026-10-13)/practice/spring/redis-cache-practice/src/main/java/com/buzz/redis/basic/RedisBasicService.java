package com.buzz.redis.basic;

import java.time.Duration;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RedisBasicService {

    // key와 value를 모두 문자열로 다루는 RedisTemplate
    private final StringRedisTemplate redisTemplate;

    // SET key value [EX ttl]
    public void set(String key, String value, Long ttlSeconds) {
        if (ttlSeconds == null) {
            redisTemplate.opsForValue().set(key, value);
            return;
        }
        redisTemplate.opsForValue().set(key, value, Duration.ofSeconds(ttlSeconds));
    }

    // GET key
    public String get(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    // TTL key
    public Long ttl(String key) {
        return redisTemplate.getExpire(key);
    }

    // INCR post:{id}:views
    public Long increaseViews(Long postId) {
        return redisTemplate.opsForValue().increment("post:" + postId + ":views");
    }
}
