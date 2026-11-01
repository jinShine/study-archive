package com.buzz.redis.ch02string;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

// 2장. String & TTL
@RestController
@RequestMapping("/ch02")
@RequiredArgsConstructor
public class StringController {

    private final StringRedisTemplate redisTemplate;

    // 기본 명령: SET / GET / TTL / MSET / MGET
    @GetMapping("/basic")
    public Map<String, Object> basic() {
        ValueOperations<String, String> ops = redisTemplate.opsForValue();
        Map<String, Object> result = new LinkedHashMap<>();

        ops.set("user:1:name", "kim");                                       // SET user:1:name kim
        result.put("GET", ops.get("user:1:name"));                           // GET → kim
        result.put("GET 없는 키", ops.get("user:999:name"));                  // → null

        ops.set("session:abc", "user:1", Duration.ofSeconds(60));            // SET session:abc user:1 EX 60
        result.put("TTL session", redisTemplate.getExpire("session:abc"));   // → 60
        ops.set("session:abc", "user:2");                                    // EX 없이 다시 SET
        result.put("TTL 다시 SET 후", redisTemplate.getExpire("session:abc")); // → -1 (TTL이 사라짐)

        ops.multiSet(Map.of("user:2:name", "lee", "user:3:name", "park"));   // MSET
        result.put("MGET", ops.multiGet(List.of("user:1:name", "user:2:name", "user:9:name")));

        redisTemplate.delete(List.of("user:1:name", "user:2:name", "user:3:name", "session:abc"));
        return result;
    }

    // 조회수: INCR (여러 서버가 동시에 올려도 정확하다)
    @PostMapping("/posts/{postId}/views")
    public Long increaseViews(@PathVariable String postId) {
        return redisTemplate.opsForValue().increment("post:" + postId + ":views");   // INCR
    }

    // 인증번호 발송: 3분짜리 번호 저장 + 1분 안에 재발송 금지
    @PostMapping("/auth-code/{phone}")
    public Map<String, Object> sendAuthCode(@PathVariable String phone) {
        // SET auth:cooldown:{phone} 1 NX EX 60 → 1분 안에 두 번째 요청이면 false
        Boolean first = redisTemplate.opsForValue()
                .setIfAbsent("auth:cooldown:" + phone, "1", Duration.ofSeconds(60));
        if (!Boolean.TRUE.equals(first)) {
            return Map.of("result", "1분 후에 다시 요청하세요",
                    "남은 초", redisTemplate.getExpire("auth:cooldown:" + phone));
        }

        String code = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
        redisTemplate.opsForValue().set("auth:code:" + phone, code, Duration.ofMinutes(3));   // SET ... EX 180
        return Map.of("result", "발송", "code", code);   // 실제로는 문자로 보내고 응답에는 넣지 않는다
    }

    // 인증번호 확인: 맞으면 바로 지워서 한 번만 쓰게 한다
    // ⚠️ 실무에서는 두 가지를 더 한다
    //   - 시도 횟수 제한: 6자리는 3분 안에 무작정 대입할 수 있다 → INCR로 세고 5회 넘으면 번호 무효화
    //   - GET → 비교 → DEL 사이에 같은 번호로 동시 요청이 끼어들 수 있다 → 6장 Lua로 한 번에
    @PostMapping("/auth-code/{phone}/verify")
    public String verifyAuthCode(@PathVariable String phone, @RequestParam String code) {
        String saved = redisTemplate.opsForValue().get("auth:code:" + phone);
        if (saved == null) {
            return "만료되었거나 요청하지 않은 번호";
        }
        if (!saved.equals(code)) {
            return "번호 불일치";
        }
        redisTemplate.delete("auth:code:" + phone);
        return "인증 성공";
    }
}
