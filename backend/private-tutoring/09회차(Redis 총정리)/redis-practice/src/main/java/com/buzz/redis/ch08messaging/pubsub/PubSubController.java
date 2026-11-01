package com.buzz.redis.ch08messaging.pubsub;

import java.util.Map;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

// 발행(PUBLISH) 쪽 API
@RestController
@RequestMapping("/ch08/pubsub")
@RequiredArgsConstructor
public class PubSubController {

    private final StringRedisTemplate redisTemplate;
    private final CacheInvalidateListener cacheInvalidateListener;

    // 이 서버의 로컬 캐시에 값 넣기
    @PostMapping("/local-cache/{key}")
    public Map<String, String> putLocalCache(@PathVariable String key, @RequestParam String value) {
        cacheInvalidateListener.getLocalCache().put(key, value);
        return cacheInvalidateListener.getLocalCache();
    }

    // 이 서버의 로컬 캐시 보기
    @GetMapping("/local-cache")
    public Map<String, String> getLocalCache() {
        return cacheInvalidateListener.getLocalCache();
    }

    // PUBLISH cache:invalidate {key} → 모든 서버가 로컬 캐시에서 key를 지운다
    @PostMapping("/invalidate/{key}")
    public String invalidate(@PathVariable String key) {
        Long receivers = redisTemplate.convertAndSend(RedisPubSubConfig.CACHE_INVALIDATE_CHANNEL, key);
        return "받은 구독자 수: " + receivers;
    }

    // PUBLISH chat:room:{roomId} {message}
    @PostMapping("/chat/{roomId}")
    public String chat(@PathVariable String roomId, @RequestParam String message) {
        Long receivers = redisTemplate.convertAndSend("chat:room:" + roomId, message);
        return "받은 구독자 수: " + receivers;
    }
}
