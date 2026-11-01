package com.buzz.redis.ch04keys;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

// 4장. 키 관리 & 메모리
@RestController
@RequestMapping("/ch04")
@RequiredArgsConstructor
public class KeysController {

    private final StringRedisTemplate redisTemplate;

    // 연습용 키 만들기: temp:session:1 ~ N (일부러 TTL 없이)
    @PostMapping("/seed")
    public String seed(@RequestParam(defaultValue = "2500") int count) {
        Map<String, String> batch = new HashMap<>();
        for (int i = 1; i <= count; i++) {
            batch.put("temp:session:" + i, "user:" + i);
            if (batch.size() == 500 || i == count) {
                redisTemplate.opsForValue().multiSet(batch);   // MSET 500개씩
                batch.clear();
            }
        }
        return count + "개 생성";
    }

    // 🔴 패턴으로 지우기: KEYS 대신 SCAN으로 조금씩 찾아서 1000개씩 지운다
    // ⚠️ 연습용이라 아무 패턴이나 받는다. pattern=* 이면 DB 전체가 지워진다.
    //    운영에서는 접두어를 코드에 고정하고, 관리자만 호출할 수 있게 막는다
    @DeleteMapping("/keys")
    public Map<String, Object> deleteByPattern(@RequestParam String pattern) {
        ScanOptions options = ScanOptions.scanOptions().match(pattern).count(1000).build();
        List<String> buffer = new ArrayList<>();
        long deleted = 0;
        int deleteCalls = 0;

        // SCAN 0 MATCH temp:session:* COUNT 1000 → 커서가 0이 될 때까지 반복
        try (Cursor<String> cursor = redisTemplate.scan(options)) {
            while (cursor.hasNext()) {
                buffer.add(cursor.next());
                if (buffer.size() == 1000) {
                    deleted += redisTemplate.unlink(buffer);   // UNLINK: 메모리 해제는 백그라운드에서
                    deleteCalls++;
                    buffer.clear();
                }
            }
        }
        if (!buffer.isEmpty()) {
            deleted += redisTemplate.unlink(buffer);
            deleteCalls++;
        }

        return Map.of("deleted", deleted, "deleteCalls", deleteCalls);
    }

    // TTL 없는 키 찾기: 삭제 사이클이 빠진 키
    @GetMapping("/no-ttl")
    public List<String> keysWithoutTtl(@RequestParam(defaultValue = "*") String pattern) {
        List<String> noTtl = new ArrayList<>();
        try (Cursor<String> cursor = redisTemplate.scan(ScanOptions.scanOptions().match(pattern).count(1000).build())) {
            while (cursor.hasNext()) {
                String key = cursor.next();
                if (Long.valueOf(-1).equals(redisTemplate.getExpire(key))) {   // TTL -1 = 만료 없음
                    noTtl.add(key);
                }
                if (noTtl.size() >= 20) {
                    break;
                }
            }
        }
        return noTtl;
    }

    // 키에 TTL 붙이기
    @PostMapping("/expire")
    public Boolean expire(@RequestParam String key, @RequestParam long seconds) {
        return redisTemplate.expire(key, Duration.ofSeconds(seconds));   // EXPIRE key seconds
    }

    // INFO memory 중 꼭 볼 항목만
    @GetMapping("/memory")
    public Map<String, String> memory() {
        Properties info = redisTemplate.execute(connection -> connection.serverCommands().info("memory"), true);
        Map<String, String> result = new LinkedHashMap<>();
        for (String name : List.of("used_memory_human", "used_memory_peak_human", "maxmemory_human", "maxmemory_policy")) {
            result.put(name, info.getProperty(name));
        }
        return result;
    }
}
