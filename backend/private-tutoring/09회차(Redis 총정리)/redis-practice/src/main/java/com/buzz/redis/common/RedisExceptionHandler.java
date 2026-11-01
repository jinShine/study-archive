package com.buzz.redis.common;

import java.util.Map;

import org.springframework.dao.QueryTimeoutException;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.slf4j.Slf4j;

// Redis가 꺼져 있거나 응답이 늦으면 500 대신 503 + 메시지로 응답한다
@Slf4j
@RestControllerAdvice
public class RedisExceptionHandler {

    @ExceptionHandler({RedisConnectionFailureException.class, QueryTimeoutException.class})
    public ResponseEntity<Map<String, String>> handle(RuntimeException e) {
        log.error("Redis 오류: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("message", "Redis에 연결할 수 없습니다"));
    }
}
