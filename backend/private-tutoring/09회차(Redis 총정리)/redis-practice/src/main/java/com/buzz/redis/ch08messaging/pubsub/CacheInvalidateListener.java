package com.buzz.redis.ch08messaging.pubsub;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

// "cache:invalidate" 채널 구독자: 메시지로 받은 키를 이 서버의 로컬 캐시에서 지운다
@Slf4j
@Component
public class CacheInvalidateListener implements MessageListener {

    // 서버마다 따로 가지는 로컬 캐시 (서버 메모리)
    private final Map<String, String> localCache = new ConcurrentHashMap<>();

    @Value("${server.port}")
    private String port;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String key = new String(message.getBody(), StandardCharsets.UTF_8);
        localCache.remove(key);
        log.info("[{}] 캐시 무효화 수신: {} → 남은 로컬 캐시 {}", port, key, localCache);
    }

    public Map<String, String> getLocalCache() {
        return localCache;
    }
}
