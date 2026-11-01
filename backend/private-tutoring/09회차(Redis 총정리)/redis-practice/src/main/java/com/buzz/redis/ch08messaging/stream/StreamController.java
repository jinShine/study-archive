package com.buzz.redis.ch08messaging.stream;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Range;
import org.springframework.data.redis.connection.RedisStreamCommands.TrimOptions;
import org.springframework.data.redis.connection.RedisStreamCommands.XAddOptions;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.PendingMessages;
import org.springframework.data.redis.connection.stream.PendingMessagesSummary;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.core.StreamOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/ch08/stream")
public class StreamController {

    private final StreamOperations<String, String, String> streamOps;
    private final String port;

    public StreamController(StringRedisTemplate redisTemplate, @Value("${server.port}") String port) {
        this.streamOps = redisTemplate.opsForStream();
        this.port = port;
    }

    // XADD stream:orders MAXLEN ~ 10000 * item {item} → 메시지 ID 반환
    // MAXLEN: 오래된 메시지를 잘라 스트림이 끝없이 커지지 않게 한다 (~ = 대략, 더 빠름)
    @PostMapping("/orders")
    public String addOrder(@RequestParam String item) {
        RecordId id = streamOps.add(
                MapRecord.create(RedisStreamConfig.STREAM_KEY, Map.of("item", item)),
                XAddOptions.trim(TrimOptions.maxLen(10_000).approximate()));
        return id.getValue();
    }

    // XLEN + XPENDING: 저장된 메시지 수, 처리 안 끝난 메시지 수
    @GetMapping("/status")
    public Map<String, Object> status() {
        PendingMessagesSummary pending = streamOps.pending(RedisStreamConfig.STREAM_KEY, RedisStreamConfig.GROUP);
        return Map.of(
                "streamLength", streamOps.size(RedisStreamConfig.STREAM_KEY),
                "pendingTotal", pending.getTotalPendingMessages(),
                "pendingByConsumer", pending.getPendingMessagesPerConsumer());
    }

    // 복구: PEL에서 5초 넘게 처리 안 된 메시지를 이 서버가 가져와(XCLAIM) 다시 처리하고 ACK
    // (minIdle 0이면 다른 서버가 지금 처리 중인 메시지까지 빼앗아 이중 처리된다)
    @PostMapping("/reclaim")
    public List<String> reclaim() {
        PendingMessages pending = streamOps.pending(
                RedisStreamConfig.STREAM_KEY, RedisStreamConfig.GROUP, Range.unbounded(), 100);
        if (pending.isEmpty()) {
            return List.of();
        }

        RecordId[] ids = pending.stream().map(p -> p.getId()).toArray(RecordId[]::new);
        List<MapRecord<String, String, String>> claimed = streamOps.claim(
                RedisStreamConfig.STREAM_KEY, RedisStreamConfig.GROUP,
                RedisStreamConfig.consumerName(port), Duration.ofSeconds(5), ids);

        for (MapRecord<String, String, String> record : claimed) {
            log.info("[{}] 재처리 {} item={}", port, record.getId(), record.getValue().get("item"));
            streamOps.acknowledge(RedisStreamConfig.GROUP, record);
        }
        return claimed.stream().map(r -> r.getId().getValue()).toList();
    }
}
