package com.buzz.redis.ch08messaging.stream;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicReference;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.RedisSystemException;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;
import org.springframework.data.redis.stream.StreamMessageListenerContainer.StreamMessageListenerContainerOptions;
import org.springframework.data.redis.stream.StreamMessageListenerContainer.StreamReadRequest;

import lombok.extern.slf4j.Slf4j;

// Consumer Group 구독 설정: 이 서버를 order-group의 consumer 하나로 등록한다
@Slf4j
@Configuration
public class RedisStreamConfig {

    public static final String STREAM_KEY = "stream:orders";
    public static final String GROUP = "order-group";

    @Bean(initMethod = "start", destroyMethod = "stop")
    public StreamMessageListenerContainer<String, MapRecord<String, String, String>> orderStreamContainer(
            RedisConnectionFactory connectionFactory,
            StringRedisTemplate redisTemplate,
            OrderStreamListener orderStreamListener,
            @Value("${server.port}") String port) {

        createGroupIfAbsent(redisTemplate);

        // XREADGROUP ... BLOCK 1000: 1초씩 기다리며 새 메시지를 가져온다
        // (Redis timeout 3초보다 짧아야 한다)
        // 읽기 실패 처리 (구독은 아래 cancelOnError(false)로 유지된다)
        // - 실행 중 실패(Redis가 잠깐 꺼짐 등): 로그를 남기고 1초 쉰다. 안 쉬면 초당 수백 번 재시도하며 로그가 넘친다
        // - 앱 종료 중 실패(연결이 먼저 닫힘): 무시
        AtomicReference<StreamMessageListenerContainer<String, MapRecord<String, String, String>>> holder =
                new AtomicReference<>();
        StreamMessageListenerContainerOptions<String, MapRecord<String, String, String>> options =
                StreamMessageListenerContainerOptions.builder()
                        .pollTimeout(Duration.ofSeconds(1))
                        .errorHandler(e -> {
                            if (holder.get() == null || !holder.get().isRunning()) {
                                return;
                            }
                            log.warn("Stream 읽기 실패, 1초 후 재시도: {}", e.getMessage());
                            try {
                                Thread.sleep(1000);
                            } catch (InterruptedException ie) {
                                Thread.currentThread().interrupt();
                            }
                        })
                        .build();

        StreamMessageListenerContainer<String, MapRecord<String, String, String>> container =
                StreamMessageListenerContainer.create(connectionFactory, options);
        holder.set(container);

        // XREADGROUP GROUP order-group consumer-{port} STREAMS stream:orders >
        // cancelOnError(e -> false): 에러가 나도 구독을 끊지 않고 계속 읽는다
        // (기본값은 에러 한 번에 구독이 영구히 취소된다 → Redis가 잠깐 끊겨도 앱 재시작 전까지 메시지를 못 받음)
        container.register(
                StreamReadRequest.builder(StreamOffset.create(STREAM_KEY, ReadOffset.lastConsumed()))
                        .consumer(Consumer.from(GROUP, consumerName(port)))
                        .autoAcknowledge(false)
                        .cancelOnError(e -> false)
                        .build(),
                orderStreamListener);

        return container;
    }

    public static String consumerName(String port) {
        return "consumer-" + port;
    }

    // XGROUP CREATE stream:orders order-group 0 MKSTREAM (이미 있으면 무시)
    private void createGroupIfAbsent(StringRedisTemplate redisTemplate) {
        try {
            redisTemplate.execute(connection -> connection.streamCommands().xGroupCreate(
                    STREAM_KEY.getBytes(StandardCharsets.UTF_8), GROUP, ReadOffset.from("0"), true), true);
            log.info("Consumer Group 생성: {}", GROUP);
        } catch (RedisSystemException e) {
            // BUSYGROUP = 이미 있음 → 무시. 그 밖의 에러는 그대로 던진다
            String message = e.getMostSpecificCause().getMessage();
            if (message == null || !message.contains("BUSYGROUP")) {
                throw e;
            }
            log.info("Consumer Group 이미 있음: {}", GROUP);
        }
    }
}
