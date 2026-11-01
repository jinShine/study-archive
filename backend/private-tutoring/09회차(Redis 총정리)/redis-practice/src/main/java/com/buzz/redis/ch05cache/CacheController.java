package com.buzz.redis.ch05cache;

import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

// 5장. 캐싱
@RestController
@RequestMapping("/ch05")
@RequiredArgsConstructor
public class CacheController {

    private final ManualCacheService manual;
    private final SpringCacheService spring;
    private final FakeProductDb db;

    // ── 직접 구현 ──
    @GetMapping("/manual/products/{id}")
    public Product manualGet(@PathVariable Long id) {
        return manual.getProduct(id);
    }

    @GetMapping("/manual/products/{id}/locked")
    public Product manualGetLocked(@PathVariable Long id) throws InterruptedException {
        return manual.getProductWithLock(id);
    }

    @PutMapping("/manual/products/{id}")
    public Product manualUpdate(@PathVariable Long id, @RequestParam int price) {
        return manual.updatePrice(id, price);
    }

    // 캐시 만료 흉내 (TTL을 기다리지 않으려고)
    @DeleteMapping("/manual/products/{id}")
    public String manualEvict(@PathVariable Long id) {
        manual.evict(id);
        return "evicted";
    }

    // ── @Cacheable ──
    @GetMapping("/spring/products/{id}")
    public Product springGet(@PathVariable Long id) {
        return spring.getProduct(id);
    }

    @PutMapping("/spring/products/{id}")
    public Product springUpdate(@PathVariable Long id, @RequestParam int price) {
        return spring.updatePrice(id, price);
    }

    // ── DB 조회 횟수 ──
    @GetMapping("/db-count")
    public Map<String, Integer> dbCount() {
        return Map.of("select", db.getSelectCount());
    }

    @PostMapping("/db-count/reset")
    public String resetCount() {
        db.resetCount();
        return "reset";
    }
}
