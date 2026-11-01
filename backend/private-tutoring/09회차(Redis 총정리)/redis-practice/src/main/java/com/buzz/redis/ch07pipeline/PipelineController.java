package com.buzz.redis.ch07pipeline;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

// 7장. Pipeline: 같은 SET N번을 하나씩 vs 한꺼번에
@RestController
@RequestMapping("/ch07")
@RequiredArgsConstructor
public class PipelineController {

    private final StringRedisTemplate redisTemplate;

    @GetMapping("/compare")
    public Map<String, Object> compare(@RequestParam(defaultValue = "10000") int count) {
        // 1. 하나씩: SET 1번 = 왕복 1번
        long start = System.currentTimeMillis();
        for (int i = 0; i < count; i++) {
            redisTemplate.opsForValue().set("pipe:one:" + i, "v" + i);
        }
        long oneByOne = System.currentTimeMillis() - start;

        // 2. Pipeline: 명령을 모아서 보내고 응답을 한꺼번에 받는다
        start = System.currentTimeMillis();
        List<Object> results = redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            for (int i = 0; i < count; i++) {
                connection.stringCommands().set(bytes("pipe:batch:" + i), bytes("v" + i));
            }
            return null;   // 반드시 null. 결과는 executePipelined의 반환값으로 온다
        });
        long pipelined = System.currentTimeMillis() - start;

        // 3. 조회도 Pipeline으로: 보낸 순서대로 결과가 온다
        List<Object> values = redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            for (int i = 0; i < 3; i++) {
                connection.stringCommands().get(bytes("pipe:batch:" + i));
            }
            return null;
        });

        // 정리: 지울 키도 Pipeline으로
        redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            for (int i = 0; i < count; i++) {
                connection.keyCommands().del(bytes("pipe:one:" + i), bytes("pipe:batch:" + i));
            }
            return null;
        });

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("count", count);
        result.put("oneByOneMs", oneByOne);
        result.put("pipelineMs", pipelined);
        result.put("pipelineResults", results.size());
        result.put("pipelineGet", new ArrayList<>(values));
        return result;
    }

    // 실습 문제 정답: 캐시 워밍업 (상품 N개를 TTL 10분으로 한 번에)
    @PostMapping("/warmup")
    public Map<String, Object> warmup(@RequestParam(defaultValue = "1000") int count) {
        long start = System.currentTimeMillis();
        redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            for (int i = 1; i <= count; i++) {
                connection.stringCommands().setEx(bytes("warmup:product:" + i), 600, bytes("name-" + i));   // SET ... EX 600
            }
            return null;
        });
        return Map.of("count", count, "ms", System.currentTimeMillis() - start);
    }

    private static byte[] bytes(String s) {
        return s.getBytes(StandardCharsets.UTF_8);
    }
}
