package com.buzz.redis.pipeline;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PipelineService {

    private final StringRedisTemplate redisTemplate;

    // 같은 개수의 SET을 "하나씩 왕복" vs "파이프라인으로 한 번에" 보내고 걸린 시간을 비교
    public Map<String, Object> compare(int count) {
        long start = System.nanoTime();
        for (int i = 0; i < count; i++) {
            redisTemplate.opsForValue().set("pipe:single:" + i, "v");
        }
        long singleMillis = (System.nanoTime() - start) / 1_000_000;

        start = System.nanoTime();
        redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            // 저수준 연결은 byte[]로 명령을 보낸다
            byte[] value = "v".getBytes(StandardCharsets.UTF_8);
            for (int i = 0; i < count; i++) {
                connection.stringCommands().set(("pipe:batch:" + i).getBytes(StandardCharsets.UTF_8), value);
            }
            // 파이프라인에서는 결과를 executePipelined가 모아서 돌려주므로 null 반환
            return null;
        });
        long pipelineMillis = (System.nanoTime() - start) / 1_000_000;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("count", count);
        result.put("singleMillis", singleMillis);
        result.put("pipelineMillis", pipelineMillis);
        return result;
    }
}
