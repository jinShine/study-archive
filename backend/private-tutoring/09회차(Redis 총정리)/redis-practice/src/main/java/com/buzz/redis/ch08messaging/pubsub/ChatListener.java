package com.buzz.redis.ch08messaging.pubsub;

import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

// "chat:room:*" 패턴 구독자: 모든 채팅방 메시지를 받는다
@Slf4j
@Component
public class ChatListener implements MessageListener {

    @Value("${server.port}")
    private String port;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String channel = new String(message.getChannel(), StandardCharsets.UTF_8);   // 실제 채널 (chat:room:1)
        String body = new String(message.getBody(), StandardCharsets.UTF_8);
        log.info("[{}] 채팅 수신 {}: {}", port, channel, body);
        // 실제 서비스라면 여기서 이 서버에 WebSocket으로 붙어 있는 사용자들에게 전달한다
    }
}
