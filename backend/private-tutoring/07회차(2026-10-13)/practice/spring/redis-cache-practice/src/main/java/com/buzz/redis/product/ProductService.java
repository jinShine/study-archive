package com.buzz.redis.product;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    // Cache-Aside 조회
    // 1. Redis에서 "product::{id}" 키를 먼저 찾는다
    // 2. 있으면(hit) 이 메서드를 실행하지 않고 캐시 값을 반환
    // 3. 없으면(miss) 메서드를 실행해 DB에서 읽고, 결과를 Redis에 저장
    @Cacheable(cacheNames = "product", key = "#id")
    public Product getProduct(Long id) {
        log.info("[Service] 캐시 miss → DB 조회 id={}", id);
        return productRepository.findById(id);
    }

    // 원본이 바뀌면 캐시를 지운다 → 다음 조회에서 새 값으로 다시 캐싱
    @CacheEvict(cacheNames = "product", key = "#id")
    public Product updatePrice(Long id, int price) {
        return productRepository.updatePrice(id, price);
    }
}
