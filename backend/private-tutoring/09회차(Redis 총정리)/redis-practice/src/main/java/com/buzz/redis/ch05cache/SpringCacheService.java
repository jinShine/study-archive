package com.buzz.redis.ch05cache;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

// 같은 Cache-Aside를 애노테이션으로 (Redis 키: product-spring::1)
@Service
@RequiredArgsConstructor
public class SpringCacheService {

    private final FakeProductDb db;

    // 캐시에 있으면 메서드를 실행하지 않고 캐시 값을 돌려준다
    @Cacheable(cacheNames = "product-spring", key = "#id", unless = "#result == null")
    public Product getProduct(Long id) {
        return db.findById(id);
    }

    // 메서드 실행 후 캐시를 지운다
    @CacheEvict(cacheNames = "product-spring", key = "#id")
    public Product updatePrice(Long id, int price) {
        return db.updatePrice(id, price);
    }
}
