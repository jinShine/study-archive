package com.buzz.redis.ch03collection;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations.TypedTuple;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

// 3장. Hash / Sorted Set / List / Set
@RestController
@RequestMapping("/ch03")
@RequiredArgsConstructor
public class CollectionController {

    private final StringRedisTemplate redisTemplate;

    // ───────── Hash: 장바구니 (필드 = 상품, 값 = 수량) ─────────

    @PostMapping("/cart/{userId}/items/{productId}")
    public Map<String, String> addToCart(@PathVariable String userId, @PathVariable String productId,
                                         @RequestParam(defaultValue = "1") long qty) {
        HashOperations<String, String, String> hash = redisTemplate.opsForHash();
        String key = "cart:" + userId;

        Long now = hash.increment(key, productId, qty);   // HINCRBY cart:1 product:10 1
        if (now <= 0) {
            hash.delete(key, productId);                  // HDEL: 0개 이하면 장바구니에서 뺀다
        }
        return hash.entries(key);                         // HGETALL
    }

    @GetMapping("/cart/{userId}")
    public Map<String, String> getCart(@PathVariable String userId) {
        HashOperations<String, String, String> hash = redisTemplate.opsForHash();
        return hash.entries("cart:" + userId);
    }

    @DeleteMapping("/cart/{userId}")
    public Boolean clearCart(@PathVariable String userId) {
        return redisTemplate.delete("cart:" + userId);
    }

    // ───────── Sorted Set: 게임 랭킹 ─────────

    @PostMapping("/ranking/{userId}")
    public Double addScore(@PathVariable String userId, @RequestParam double score) {
        return redisTemplate.opsForZSet().incrementScore("ranking", userId, score);   // ZINCRBY ranking 100 kim
    }

    @GetMapping("/ranking/top")
    public List<String> top(@RequestParam(defaultValue = "3") int n) {
        // ZREVRANGE ranking 0 n-1 WITHSCORES
        Set<TypedTuple<String>> tuples = redisTemplate.opsForZSet().reverseRangeWithScores("ranking", 0, n - 1);
        int rank = 1;
        List<String> lines = new ArrayList<>();
        for (TypedTuple<String> t : tuples) {
            lines.add(rank++ + "등 " + t.getValue() + " (" + t.getScore().intValue() + "점)");
        }
        return lines;
    }

    @GetMapping("/ranking/{userId}")
    public Map<String, Object> myRank(@PathVariable String userId) {
        Long rank = redisTemplate.opsForZSet().reverseRank("ranking", userId);    // ZREVRANK (0부터)
        Double score = redisTemplate.opsForZSet().score("ranking", userId);      // ZSCORE
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("rank", rank == null ? null : rank + 1);
        result.put("score", score);
        result.put("total", redisTemplate.opsForZSet().size("ranking"));         // ZCARD
        return result;
    }

    // ───────── List: 최근 본 상품 5개 ─────────

    @PostMapping("/recent/{userId}")
    public List<String> view(@PathVariable String userId, @RequestParam String productId) {
        String key = "recent:" + userId;
        redisTemplate.opsForList().remove(key, 0, productId);   // LREM: 이미 있으면 빼고
        redisTemplate.opsForList().leftPush(key, productId);    // LPUSH: 맨 앞에 넣고
        redisTemplate.opsForList().trim(key, 0, 4);             // LTRIM 0 4: 5개만 남긴다
        return redisTemplate.opsForList().range(key, 0, -1);    // LRANGE 0 -1
    }

    // ───────── Set: 좋아요 (한 사람당 한 번) ─────────

    @PostMapping("/posts/{postId}/likes/{userId}")
    public Map<String, Object> like(@PathVariable String postId, @PathVariable String userId) {
        String key = "post:" + postId + ":likes";
        Long added = redisTemplate.opsForSet().add(key, userId);   // SADD: 새로 넣으면 1, 이미 있으면 0
        return Map.of("added", added, "count", redisTemplate.opsForSet().size(key));   // SCARD
    }

    @GetMapping("/posts/{postId}/likes/{userId}")
    public Boolean liked(@PathVariable String postId, @PathVariable String userId) {
        return redisTemplate.opsForSet().isMember("post:" + postId + ":likes", userId);   // SISMEMBER
    }
}
