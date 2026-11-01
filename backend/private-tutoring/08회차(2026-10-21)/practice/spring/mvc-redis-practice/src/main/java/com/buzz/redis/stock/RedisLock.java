package com.buzz.redis.stock;

import java.time.Duration;
import java.util.List;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

// Redis 분산 락 (가장 단순한 형태)
// - 획득: SET key token NX PX ttl  → 키가 없을 때만 저장 = 한 명만 성공
// - 해제: Lua 스크립트로 "내 token일 때만 DEL"을 원자적으로 실행
@Component
@RequiredArgsConstructor
public class RedisLock {

    private static final RedisScript<Long> UNLOCK_SCRIPT = new DefaultRedisScript<>(
            "if redis.call('GET', KEYS[1]) == ARGV[1] then "
                    + "return redis.call('DEL', KEYS[1]) "
                    + "else return 0 end",
            Long.class);

    private final StringRedisTemplate redisTemplate;

    // 락을 얻을 때까지 10ms 간격으로 재시도, wait 시간이 지나면 포기(fail fast)
    public boolean tryLock(String key, String token, Duration ttl, Duration wait) throws InterruptedException {
        long deadline = System.currentTimeMillis() + wait.toMillis();
        while (System.currentTimeMillis() < deadline) {
            Boolean acquired = redisTemplate.opsForValue().setIfAbsent(key, token, ttl);
            if (Boolean.TRUE.equals(acquired)) {
                return true;
            }
            Thread.sleep(10);
        }
        return false;
    }

    public boolean unlock(String key, String token) {
        Long deleted = redisTemplate.execute(UNLOCK_SCRIPT, List.of(key), token);
        return deleted != null && deleted == 1L;
    }
}
