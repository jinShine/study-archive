# 7회차(2026/10/13) Spring 실습 — Spring Data Redis, Spring Cache

- 프로젝트: [redis-cache-practice](./redis-cache-practice)
- 개념 설명: [PRESTUDY.md](../../PRESTUDY.md)
- 환경: Spring Boot 4.1.1, Java 21, Redis 7.4 (Docker), Lettuce 7.5
- 아래 결과는 전부 직접 실행해서 얻은 값이다.

## 오늘 만든 것

| 번호 | 실습                         | 확인할 것                                                     |
| ---- | ---------------------------- | ------------------------------------------------------------- |
| 1    | StringRedisTemplate 기본     | Java 코드로 SET/GET/TTL/INCR → redis-cli에서 같은 키가 보인다 |
| 2    | Spring Cache (`@Cacheable`)  | 첫 조회 1초 → 두 번째부터 수 ms, 수정 시 캐시 삭제            |

> Tomcat 스레드 확인, 재고 동시 차감 + 분산 락, Pipeline 실습은 [8회차 실습](<../../../08회차(2026-10-21)/practice/spring/README.md>)으로 옮겼다.

## 파일 구조

```text
redis-cache-practice/
  compose.yaml                         Redis 컨테이너 (호스트 6380)
  build.gradle                         webmvc + data-redis + cache + lombok
  src/main/resources/application.properties
  src/main/java/com/buzz/redis/
    RedisCachePracticeApplication.java
    config/CacheConfig.java            @EnableCaching, "product" 캐시 TTL·JSON 설정
    basic/RedisBasicController.java    실습 1
    basic/RedisBasicService.java
    product/Product.java               실습 2
    product/ProductRepository.java     느린 DB 흉내 (조회 1초)
    product/ProductService.java        @Cacheable, @CacheEvict
    product/ProductController.java
```

## 실행 방법

```bash
cd redis-cache-practice

# 1. Redis 실행 (이미 redis-study 컨테이너가 있으면 docker start redis-study)
docker compose up -d

# 2. 앱 실행
./gradlew bootRun
```

`Tomcat started on port 8080`, `Started RedisCachePracticeApplication`이 보이면 준비 완료.

Redis 안을 들여다볼 터미널을 하나 더 열어 둔다.

```bash
docker exec -it redis-study redis-cli
```

## 설정 — application.properties

```properties
spring.data.redis.host=localhost
spring.data.redis.port=6380
spring.cache.type=redis
```

- `spring.data.redis.*`만 적으면 Spring Boot가 `RedisConnectionFactory`, `StringRedisTemplate` 같은 Bean을 **자동으로 만든다** (2회차 Bean). 우리는 생성자로 주입만 받는다.

---

## 1. StringRedisTemplate 기본

```java
@Service
@RequiredArgsConstructor
public class RedisBasicService {
    private final StringRedisTemplate redisTemplate;

    public void set(String key, String value, Long ttlSeconds) {
        if (ttlSeconds == null) {
            redisTemplate.opsForValue().set(key, value);                                  // SET key value
            return;
        }
        redisTemplate.opsForValue().set(key, value, Duration.ofSeconds(ttlSeconds));     // SET key value EX ttl
    }
    public String get(String key) { return redisTemplate.opsForValue().get(key); }       // GET key
    public Long ttl(String key) { return redisTemplate.getExpire(key); }                 // TTL key
    public Long increaseViews(Long postId) {
        return redisTemplate.opsForValue().increment("post:" + postId + ":views");       // INCR key
    }
}
```

`opsForValue()`는 **String 타입 명령 모음**이다. Hash는 `opsForHash()`, List는 `opsForList()`, Set은 `opsForSet()`, Sorted Set은 `opsForZSet()`.

```bash
curl -X POST "localhost:8080/redis/strings/greeting?value=hello"
curl localhost:8080/redis/strings/greeting
curl -X POST "localhost:8080/redis/strings/otp?value=123456&ttlSeconds=60"
curl localhost:8080/redis/strings/otp
curl localhost:8080/redis/strings/nothing
curl -X POST localhost:8080/redis/posts/1/views
curl -X POST localhost:8080/redis/posts/1/views
```

```text
OK
{"key":"greeting","value":"hello","ttl":-1}
OK
{"key":"otp","value":"123456","ttl":60}
{"key":"nothing","value":null,"ttl":-2}
1
2
```

redis-cli에서 같은 키 확인:

```text
127.0.0.1:6379> GET greeting
"hello"
127.0.0.1:6379> TTL otp
(integer) 60
127.0.0.1:6379> GET post:1:views
"2"
```

**확인할 것**: Java 코드가 보낸 명령이 redis-cli로 친 명령과 **똑같은 키·값**으로 저장된다. `StringRedisTemplate`은 Redis 명령을 Java 메서드로 감싼 것일 뿐이다. TTL `-1`(만료 없음), `-2`(키 없음)도 cli와 같다.

---

## 2. Spring Cache — `@Cacheable`, `@CacheEvict`

### 코드

```java
// ProductRepository: 조회에 1초 걸리는 "느린 DB"
public Product findById(Long id) {
    log.info("[DB] 상품 조회 id={} (1초 소요)", id);
    sleep(1000);
    return store.get(id);
}
```

```java
// ProductService
@Cacheable(cacheNames = "product", key = "#id")
public Product getProduct(Long id) {
    log.info("[Service] 캐시 miss → DB 조회 id={}", id);
    return productRepository.findById(id);
}

@CacheEvict(cacheNames = "product", key = "#id")
public Product updatePrice(Long id, int price) {
    return productRepository.updatePrice(id, price);
}
```

```java
// CacheConfig: product 캐시는 TTL 10분, 값은 JSON
@EnableCaching
@Configuration
public class CacheConfig {
    @Bean
    public RedisCacheManagerBuilderCustomizer productCacheCustomizer() {
        RedisCacheConfiguration productConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeValuesWith(SerializationPair.fromSerializer(new JacksonJsonRedisSerializer<>(Product.class)));
        return builder -> builder.withCacheConfiguration("product", productConfig);
    }
}
```

### 실행

```bash
curl -w '  (%{time_total}s)\n' localhost:8080/products/1     # 1번째
curl -w '  (%{time_total}s)\n' localhost:8080/products/1     # 2번째
curl -w '  (%{time_total}s)\n' localhost:8080/products/1     # 3번째
```

```text
{"id":1,"name":"keyboard","price":50000}  (1.085091s)
{"id":1,"name":"keyboard","price":50000}  (0.024249s)
{"id":1,"name":"keyboard","price":50000}  (0.003965s)
```

redis-cli:

```text
127.0.0.1:6379> KEYS product*
1) "product::1"
127.0.0.1:6379> GET product::1
"{\"id\":1,\"name\":\"keyboard\",\"price\":50000}"
127.0.0.1:6379> TTL product::1
(integer) 600
```

가격 수정 → 캐시 삭제 → 다시 조회:

```bash
curl -w '  (%{time_total}s)\n' -X PUT "localhost:8080/products/1/price?price=45000"
curl -w '  (%{time_total}s)\n' localhost:8080/products/1
curl -w '  (%{time_total}s)\n' localhost:8080/products/1
```

```text
{"id":1,"name":"keyboard","price":45000}  (0.007287s)
{"id":1,"name":"keyboard","price":45000}  (1.012453s)
{"id":1,"name":"keyboard","price":45000}  (0.004623s)
```

```text
127.0.0.1:6379> EXISTS product::1      ← 수정 직후
(integer) 0
```

앱 로그 (전체 과정):

```text
[Service] 캐시 miss → DB 조회 id=1
[DB] 상품 조회 id=1 (1초 소요)
[DB] 상품 가격 수정 id=1 price=45000
[Service] 캐시 miss → DB 조회 id=1
[DB] 상품 조회 id=1 (1초 소요)
```

### 결과 해석

| 요청          | 시간    | 일어난 일                                                            |
| ------------- | ------- | -------------------------------------------------------------------- |
| 1번째 조회    | 1.08초  | 캐시 miss → 메서드 실행 → DB 1초 → 결과를 `product::1`에 저장        |
| 2·3번째 조회  | 4~24ms  | 캐시 hit → **메서드 자체가 실행되지 않음** (로그 없음) → Redis 값 반환 |
| 가격 수정     | 7ms     | DB 수정 + `@CacheEvict`로 `product::1` 삭제                          |
| 수정 후 조회  | 1.01초  | 캐시 miss → DB에서 **새 가격(45000)** 을 읽어 다시 캐싱              |

- 캐시 키는 **`캐시이름::key`** 형식(`product::1`)이다.
- `@Cacheable` 메서드 안의 로그가 hit일 때 **찍히지 않는다**. 프록시가 메서드 호출 자체를 막았기 때문이다 (3회차 `@Transactional` 프록시와 같은 구조).
- 수정 시 캐시를 지우지 않았다면 10분(TTL) 동안 **옛 가격 50000**이 보였을 것이다.

---

## 막혔던 부분

### 6379 포트 충돌

다른 프로젝트의 Redis가 6379를 쓰고 있어 `port is already allocated` 에러 → 호스트 포트를 6380으로 바꿨다(`compose.yaml`, `application.properties`).

## 다음에 다시 볼 질문

- `@Cacheable`이 붙은 메서드를 같은 클래스 안에서 `this.getProduct()`로 부르면 캐시가 동작할까? (3회차 self-invocation)
- 캐시 TTL이 끝나는 순간 요청 1000개가 동시에 들어오면? (Cache Stampede)
