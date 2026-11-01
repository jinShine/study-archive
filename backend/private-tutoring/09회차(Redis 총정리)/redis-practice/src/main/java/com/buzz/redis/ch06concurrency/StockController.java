package com.buzz.redis.ch06concurrency;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

// 6장. 동시성: 같은 "재고 1 줄이기"를 4가지 방법으로
@RestController
@RequestMapping("/ch06/stock")
@RequiredArgsConstructor
public class StockController {

    private static final String STOCK_KEY = "stock:product:1";
    private static final String LOCK_KEY = "lock:stock:product:1";
    private static final String SOLD_KEY = "stock:product:1:sold";   // "판매 성공"이라고 응답한 횟수

    private static final RedisScript<Long> DECREASE_SCRIPT =
            RedisScript.of(new ClassPathResource("scripts/stock-decrease.lua"), Long.class);
    private static final RedisScript<Long> UNLOCK_SCRIPT =
            RedisScript.of(new ClassPathResource("scripts/unlock.lua"), Long.class);

    private final StringRedisTemplate redisTemplate;

    @PostMapping("/reset")
    public String reset(@RequestParam int qty) {
        redisTemplate.opsForValue().set(STOCK_KEY, String.valueOf(qty));
        redisTemplate.opsForValue().set(SOLD_KEY, "0");
        return "stock=" + qty;
    }

    // 남은 재고와 판매 성공 응답 수
    @GetMapping
    public Map<String, String> status() {
        return Map.of(
                "stock", String.valueOf(redisTemplate.opsForValue().get(STOCK_KEY)),
                "sold", String.valueOf(redisTemplate.opsForValue().get(SOLD_KEY)));
    }

    // ❌ 1. GET → 확인 → SET: 읽고 쓰는 사이에 다른 요청이 끼어든다
    @PostMapping("/naive")
    public String naive() {
        return decreaseWithGetSet();
    }

    // ❌ 2. DECR: 원자적이지만 "남아 있을 때만"을 확인하지 못한다
    @PostMapping("/decr")
    public String decr() {
        Long left = redisTemplate.opsForValue().decrement(STOCK_KEY);
        redisTemplate.opsForValue().increment(SOLD_KEY);   // 재고 확인 없이 무조건 판매
        return "left=" + left;
    }

    // ✅ 3. Lua: 확인 + 차감을 Redis 안에서 한 번에
    @PostMapping("/lua")
    public String lua() {
        Long left = redisTemplate.execute(DECREASE_SCRIPT, List.of(STOCK_KEY));
        if (left == null || left == -1) {
            return "품절";
        }
        redisTemplate.opsForValue().increment(SOLD_KEY);
        return "left=" + left;
    }

    // ✅ 4. 분산 락: 락을 잡은 요청 하나만 1번 방식(GET → SET)을 실행
    @PostMapping("/lock")
    public String lock() throws InterruptedException {
        String token = UUID.randomUUID().toString();   // 내 락인지 구분하는 값

        for (int i = 0; i < 300; i++) {                // 최대 300 x 10ms = 3초 기다림
            // SET lock:stock:product:1 {token} NX EX 3
            Boolean locked = redisTemplate.opsForValue().setIfAbsent(LOCK_KEY, token, Duration.ofSeconds(3));
            if (Boolean.TRUE.equals(locked)) {
                try {
                    return decreaseWithGetSet();       // 이 안은 한 번에 한 요청만 들어온다
                } finally {
                    redisTemplate.execute(UNLOCK_SCRIPT, List.of(LOCK_KEY), token);   // 내 토큰일 때만 DEL
                }
            }
            Thread.sleep(10);
        }
        return "락 획득 실패";
    }

    private String decreaseWithGetSet() {
        String value = redisTemplate.opsForValue().get(STOCK_KEY);                  // GET
        int stock = value == null ? 0 : Integer.parseInt(value);                    // 키가 없으면 0 (reset 전)
        if (stock <= 0) {
            return "품절";
        }
        redisTemplate.opsForValue().set(STOCK_KEY, String.valueOf(stock - 1));     // SET
        redisTemplate.opsForValue().increment(SOLD_KEY);
        return "left=" + (stock - 1);
    }
}
