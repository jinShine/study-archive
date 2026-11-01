package com.buzz.redis.config;

import java.time.Duration;

import org.springframework.boot.cache.autoconfigure.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;

import com.buzz.redis.product.Product;

// @Cacheable 같은 캐시 애노테이션을 켜는 스위치
@EnableCaching
@Configuration
public class CacheConfig {

    // "product" 캐시의 저장 방식을 지정한다
    // - TTL 10분: 10분이 지나면 Redis가 자동으로 키를 지운다
    // - 값은 JSON으로 저장: redis-cli에서 사람이 읽을 수 있게
    @Bean
    public RedisCacheManagerBuilderCustomizer productCacheCustomizer() {
        RedisCacheConfiguration productConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeValuesWith(SerializationPair.fromSerializer(new JacksonJsonRedisSerializer<>(Product.class)));

        return builder -> builder.withCacheConfiguration("product", productConfig);
    }
}
