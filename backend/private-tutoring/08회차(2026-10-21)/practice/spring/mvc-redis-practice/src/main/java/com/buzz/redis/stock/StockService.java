package com.buzz.redis.stock;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockService {

    private static final String STOCK_KEY = "stock";
    private static final String LOCK_KEY = "lock:stock";

    // 재고 확인 + 차감을 Redis 안에서 한 번에 실행 (중간에 다른 요청이 끼어들 수 없다)
    // 반환: 차감 후 재고, 재고가 없으면 -1
    private static final RedisScript<Long> DECREASE_SCRIPT = new DefaultRedisScript<>(
            "local stock = tonumber(redis.call('GET', KEYS[1])) "
                    + "if stock == nil or stock <= 0 then return -1 end "
                    + "return redis.call('DECR', KEYS[1])",
            Long.class);

    private final StringRedisTemplate redisTemplate;
    private final RedisLock redisLock;

    public void reset(int quantity) {
        redisTemplate.opsForValue().set(STOCK_KEY, String.valueOf(quantity));
    }

    public String get() {
        return redisTemplate.opsForValue().get(STOCK_KEY);
    }

    // ❌ GET → 계산 → SET (Read-Modify-Write)
    // 두 요청이 같은 값을 읽으면 하나의 차감이 유실된다 (6회차 x++와 같은 문제)
    public void decreaseUnsafe() {
        readModifyWrite();
    }

    // ✅ DECR 한 명령으로 처리. Redis는 명령을 하나씩 순서대로 실행하므로 끼어들 틈이 없다
    public void decreaseAtomic() {
        redisTemplate.opsForValue().decrement(STOCK_KEY);
    }

    // ✅ Lua: 재고 확인과 차감을 원자적으로. 재고가 0이면 더 빼지 않는다
    public Long decreaseWithLua() {
        return redisTemplate.execute(DECREASE_SCRIPT, List.of(STOCK_KEY));
    }

    // ✅ 분산 락으로 Read-Modify-Write 구간 전체를 한 번에 한 요청만 실행
    public void decreaseWithLock() throws InterruptedException {
        String token = UUID.randomUUID().toString();
        if (!redisLock.tryLock(LOCK_KEY, token, Duration.ofSeconds(3), Duration.ofSeconds(5))) {
            throw new IllegalStateException("락 획득 실패");
        }
        try {
            readModifyWrite();
        } finally {
            redisLock.unlock(LOCK_KEY, token);
        }
    }

    private void readModifyWrite() {
        int stock = Integer.parseInt(redisTemplate.opsForValue().get(STOCK_KEY));
        if (stock > 0) {
            redisTemplate.opsForValue().set(STOCK_KEY, String.valueOf(stock - 1));
        }
    }
}
