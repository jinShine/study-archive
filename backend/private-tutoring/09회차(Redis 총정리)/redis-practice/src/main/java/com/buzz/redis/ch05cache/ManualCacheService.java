package com.buzz.redis.ch05cache;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import tools.jackson.databind.json.JsonMapper;

// Cache-Aside를 StringRedisTemplate으로 직접 구현
@Service
@RequiredArgsConstructor
public class ManualCacheService {

    private static final Duration TTL = Duration.ofSeconds(60);
    private static final Duration LOCK_TTL = Duration.ofSeconds(3);

    // 값이 내 토큰일 때만 지우는 스크립트 (6장 분산 락에서 자세히 배운다)
    private static final RedisScript<Long> UNLOCK_SCRIPT =
            RedisScript.of(new ClassPathResource("scripts/unlock.lua"), Long.class);

    private final StringRedisTemplate redisTemplate;
    private final FakeProductDb db;
    private final JsonMapper jsonMapper;   // 객체 ↔ JSON 문자열

    private String key(Long id) {
        return "product:" + id;
    }

    // 1. 조회: 캐시 → 없으면 DB → 캐시에 저장
    public Product getProduct(Long id) {
        String cached = redisTemplate.opsForValue().get(key(id));                 // GET product:1
        if (cached != null) {
            return jsonMapper.readValue(cached, Product.class);                   // Hit
        }
        Product product = db.findById(id);                                       // Miss → DB
        if (product != null) {
            redisTemplate.opsForValue().set(key(id), jsonMapper.writeValueAsString(product), TTL);   // SET ... EX 60
        }
        return product;
    }

    // 2. 수정: DB를 바꾸고 캐시는 지운다
    public Product updatePrice(Long id, int price) {
        Product updated = db.updatePrice(id, price);
        redisTemplate.delete(key(id));                                           // DEL product:1
        return updated;
    }

    // 3. Cache Stampede 방지: Miss일 때 락을 잡은 요청 1개만 DB에 간다
    public Product getProductWithLock(Long id) throws InterruptedException {
        String lockKey = "lock:" + key(id);
        String token = UUID.randomUUID().toString();                             // 내 락인지 구분하는 값

        for (int i = 0; i < 50; i++) {                                           // 최대 50 x 50ms = 2.5초
            String cached = redisTemplate.opsForValue().get(key(id));
            if (cached != null) {
                return jsonMapper.readValue(cached, Product.class);
            }
            // SET lock:product:1 {token} NX EX 3 → 동시에 와도 한 요청만 true
            Boolean locked = redisTemplate.opsForValue().setIfAbsent(lockKey, token, LOCK_TTL);
            if (Boolean.TRUE.equals(locked)) {
                try {
                    // 락을 잡는 사이에 앞 요청이 캐시를 채웠을 수 있다 → 한 번 더 확인
                    String again = redisTemplate.opsForValue().get(key(id));
                    if (again != null) {
                        return jsonMapper.readValue(again, Product.class);
                    }
                    Product product = db.findById(id);
                    if (product != null) {
                        redisTemplate.opsForValue().set(key(id), jsonMapper.writeValueAsString(product), TTL);
                    }
                    return product;
                } finally {
                    redisTemplate.execute(UNLOCK_SCRIPT, List.of(lockKey), token);   // 내 락일 때만 DEL
                }
            }
            Thread.sleep(50);                                                    // 락 못 잡음 → 잠깐 뒤 캐시 다시 확인
        }
        return db.findById(id);                                                  // 너무 오래 걸리면 DB로
    }

    public void evict(Long id) {
        redisTemplate.delete(key(id));
    }
}
