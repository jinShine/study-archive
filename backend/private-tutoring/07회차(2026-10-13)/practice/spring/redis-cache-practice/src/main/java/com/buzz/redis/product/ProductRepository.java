package com.buzz.redis.product;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;

import lombok.extern.slf4j.Slf4j;

// 실제 DB 대신 메모리 Map을 쓰고, 조회에 1초가 걸리는 "느린 DB"를 흉내 낸다
@Slf4j
@Repository
public class ProductRepository {

    private final Map<Long, Product> store = new ConcurrentHashMap<>(Map.of(
            1L, new Product(1L, "keyboard", 50000),
            2L, new Product(2L, "mouse", 30000)
    ));

    public Product findById(Long id) {
        log.info("[DB] 상품 조회 id={} (1초 소요)", id);
        sleep(1000);
        return store.get(id);
    }

    public Product updatePrice(Long id, int price) {
        log.info("[DB] 상품 가격 수정 id={} price={}", id, price);
        Product updated = new Product(id, store.get(id).name(), price);
        store.put(id, updated);
        return updated;
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
