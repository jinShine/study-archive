package com.buzz.redis.ch08messaging.stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.stream.StreamListener;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// 주문 메시지를 하나 받을 때마다 호출된다
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderStreamListener implements StreamListener<String, MapRecord<String, String, String>> {

    private final StringRedisTemplate redisTemplate;

    @Value("${server.port}")
    private String port;

    @Override
    public void onMessage(MapRecord<String, String, String> record) {
        String item = record.getValue().get("item");

        // 처리 실패 흉내: ACK를 하지 않으면 PEL(대기 목록)에 남는다
        if ("fail".equals(item)) {
            log.warn("[{}] 처리 실패 {} → ACK 안 함 (PEL에 남음)", port, record.getId());
            return;
        }

        log.info("[{}] 주문 처리 {} item={}", port, record.getId(), item);

        // XACK: 처리 완료 → PEL에서 제거
        redisTemplate.opsForStream().acknowledge(RedisStreamConfig.GROUP, record);
    }
}
