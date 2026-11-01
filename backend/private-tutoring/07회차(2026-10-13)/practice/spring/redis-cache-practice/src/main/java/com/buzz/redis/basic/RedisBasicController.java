package com.buzz.redis.basic;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/redis")
public class RedisBasicController {

    private final RedisBasicService redisBasicService;

    @PostMapping("/strings/{key}")
    public String set(@PathVariable String key,
                      @RequestParam String value,
                      @RequestParam(required = false) Long ttlSeconds) {
        redisBasicService.set(key, value, ttlSeconds);
        return "OK";
    }

    @GetMapping("/strings/{key}")
    public Map<String, Object> get(@PathVariable String key) {
        String value = redisBasicService.get(key);
        Long ttl = redisBasicService.ttl(key);
        // 응답 필드 순서를 고정하기 위해 LinkedHashMap 사용
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("key", key);
        result.put("value", value);
        result.put("ttl", ttl);
        return result;
    }

    @PostMapping("/posts/{postId}/views")
    public Long increaseViews(@PathVariable Long postId) {
        return redisBasicService.increaseViews(postId);
    }
}
