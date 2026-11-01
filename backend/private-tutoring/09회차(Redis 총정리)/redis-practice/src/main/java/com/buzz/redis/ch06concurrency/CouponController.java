package com.buzz.redis.ch06concurrency;

import java.util.List;
import java.util.Map;

import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

// 6장 실습 문제 정답: 선착순 쿠폰 (1인 1장)
@RestController
@RequestMapping("/ch06/coupon")
@RequiredArgsConstructor
public class CouponController {

    private static final String STOCK_KEY = "coupon:stock";
    private static final String ISSUED_KEY = "coupon:issued";

    private static final RedisScript<Long> ISSUE_SCRIPT =
            RedisScript.of(new ClassPathResource("scripts/coupon-issue.lua"), Long.class);

    private final StringRedisTemplate redisTemplate;

    @PostMapping("/reset")
    public String reset(@RequestParam int stock) {
        redisTemplate.delete(List.of(STOCK_KEY, ISSUED_KEY));
        redisTemplate.opsForValue().set(STOCK_KEY, String.valueOf(stock));
        return "stock=" + stock;
    }

    @PostMapping("/{userId}")
    public String issue(@PathVariable String userId) {
        Long result = redisTemplate.execute(ISSUE_SCRIPT, List.of(STOCK_KEY, ISSUED_KEY), userId);
        if (Long.valueOf(1).equals(result)) {
            return "발급";
        }
        return Long.valueOf(0).equals(result) ? "품절" : "이미 받음";
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of(
                "stock", String.valueOf(redisTemplate.opsForValue().get(STOCK_KEY)),   // 없으면 "null"
                "issued", redisTemplate.opsForSet().size(ISSUED_KEY));
    }
}
