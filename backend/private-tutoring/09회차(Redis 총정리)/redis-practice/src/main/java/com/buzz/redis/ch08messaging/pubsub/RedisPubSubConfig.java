package com.buzz.redis.ch08messaging.pubsub;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

// 구독(SUBSCRIBE) 설정: "어떤 채널을 누가 듣는지" 등록한다
@Configuration
public class RedisPubSubConfig {

    public static final String CACHE_INVALIDATE_CHANNEL = "cache:invalidate";
    public static final String CHAT_ROOM_PATTERN = "chat:room:*";

    // 구독 전용 연결을 하나 잡고, 메시지가 오면 등록된 Listener에게 넘겨준다
    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            CacheInvalidateListener cacheInvalidateListener,
            ChatListener chatListener) {

        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);

        // SUBSCRIBE cache:invalidate (정확한 채널 이름)
        container.addMessageListener(cacheInvalidateListener, new ChannelTopic(CACHE_INVALIDATE_CHANNEL));

        // PSUBSCRIBE chat:room:* (패턴)
        container.addMessageListener(chatListener, new PatternTopic(CHAT_ROOM_PATTERN));

        return container;
    }
}
