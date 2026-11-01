package com.buzz.redis.mvc;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
public class OrderController {

    // 예외 처리는 Controller에서 하지 않는다. 던지기만 하고 GlobalExceptionHandler가 응답을 만든다
    @GetMapping("/orders/{id}")
    public Map<String, Object> getOrder(@PathVariable Long id) {
        log.info("[Controller] getOrder id={}", id);
        if (id <= 0) {
            throw new IllegalArgumentException("주문 번호는 1 이상이어야 합니다");
        }
        if (id == 999) {
            throw new IllegalStateException("이미 취소된 주문입니다");
        }
        return Map.of("id", id, "status", "PAID");
    }
}
