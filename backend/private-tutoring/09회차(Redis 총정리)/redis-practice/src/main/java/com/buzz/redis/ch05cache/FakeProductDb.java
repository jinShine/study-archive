package com.buzz.redis.ch05cache;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Component;

// 실제 DB 대신 쓰는 가짜 DB: 조회 1번에 200ms 걸리고, 몇 번 조회됐는지 센다
@Component
public class FakeProductDb {

    private final Map<Long, Product> table = new ConcurrentHashMap<>(Map.of(
            1L, new Product(1L, "keyboard", 10000),
            2L, new Product(2L, "mouse", 20000)));
    private final AtomicInteger selectCount = new AtomicInteger();

    public Product findById(Long id) {
        selectCount.incrementAndGet();
        try {
            Thread.sleep(200);   // 느린 쿼리 흉내
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return table.get(id);
    }

    public Product updatePrice(Long id, int price) {
        Product updated = new Product(id, table.get(id).name(), price);
        table.put(id, updated);
        return updated;
    }

    public int getSelectCount() {
        return selectCount.get();
    }

    public void resetCount() {
        selectCount.set(0);
    }
}
