package com.buzz.redis.ch05cache;

import java.time.Duration;

import org.springframework.boot.cache.autoconfigure.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;

// @Cacheable을 켜고, "product-spring" 캐시의 TTL과 저장 형식을 정한다
@EnableCaching
@Configuration
public class CacheConfig {

    @Bean
    public RedisCacheManagerBuilderCustomizer productCacheCustomizer() {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(60))                                    // TTL 60초 (기본은 TTL 없음)
                .serializeValuesWith(SerializationPair.fromSerializer(
                        new JacksonJsonRedisSerializer<>(Product.class)));           // 값을 JSON으로 저장

        return builder -> builder.withCacheConfiguration("product-spring", config);
    }
}
