package com.buzz.redis.common;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

// Redis 연결 확인용: GET /ping → Redis에 PING을 보내고 응답(PONG)을 그대로 돌려준다
@RestController
@RequiredArgsConstructor
public class PingController {

    private final StringRedisTemplate redisTemplate;

    @GetMapping("/ping")
    public String ping() {
        return redisTemplate.execute(connection -> connection.ping(), true);
    }
}
