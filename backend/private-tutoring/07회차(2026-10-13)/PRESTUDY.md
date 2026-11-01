# 7회차(2026/10/13) 예습 — Redis와 캐시

- 실습 1: [redis-cli 명령어 실습](./practice/redis-cli/README.md)
- 실습 2: [Spring 실습 (redis-cache-practice)](./practice/spring/README.md)
- 실습 결과는 전부 직접 실행해서 얻은 값이다.

## 한눈에 보기

```text
[1~2장] Redis: DB 앞에 두는 빠른 메모리 저장소, 기본 명령어
[3장]   캐싱 전략: 언제 넣고, 언제 지우나
[4~5장] Spring에서 쓰기: Spring Data Redis, Spring Cache
```

> Spring MVC와 Redis 심화(분산 락, Pub/Sub, Lua, Pipeline)는 [8회차 PRESTUDY](<../08회차(2026-10-21)/PRESTUDY.md>)에서 다룬다.

---

## 1. Redis란?

**Redis = 메모리에 데이터를 저장하는 Key-Value 저장소.** MySQL처럼 따로 실행되는 서버이고, 애플리케이션은 네트워크(기본 포트 6379)로 접속해서 명령을 보낸다.

### 1.1 왜 쓰나 — DB 앞의 빠른 보관소

```text
                    ┌── 있으면(hit) ──▶ 바로 응답 (빠름, 보통 1ms 미만)
요청 ─▶ Redis 확인 ─┤
                    └── 없으면(miss) ─▶ MySQL 조회 ─▶ Redis에 저장 ─▶ 응답
```

**"서버 메모리의 HashMap에 저장하면 안 되나?"**

| HashMap (서버 메모리)                      | Redis (서버 밖)                  |
| ------------------------------------------ | -------------------------------- |
| 서버가 3대면 3개가 따로 논다 → 값이 다를 수 있음 | **모든 서버가 같은 값을 본다** |
| 서버를 재시작하면 사라진다                 | 서버 재시작과 무관하게 유지      |

1회차에서 배운 "서버는 상태를 갖지 않는다(stateless)"를 지키면서 캐시를 쓰려면, 캐시도 서버 밖에 있어야 한다.

### 1.2 꼭 알아야 할 특징 4가지

| 특징                    | 의미                                             | 실무에서                                          |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------- |
| **메모리 저장**         | 디스크보다 훨씬 빠르다                           | 대신 용량이 작다 → 자주 쓰는 데이터만 넣는다      |
| **Key-Value**           | 키로 값을 바로 찾는다. SQL·JOIN이 없다           | 키 이름을 잘 짓는 게 중요하다 (`user:1:name`)     |
| **명령을 하나씩 처리**  | 단일 스레드라 명령 하나는 중간에 끼어들 수 없다  | `INCR`이 동시 요청에도 안전한 이유. 대신 느린 명령(`KEYS *`) 하나가 전체를 멈춘다 |
| **데이터가 사라질 수 있다** | 메모리가 꽉 차거나 재시작하면 지워질 수 있다 | **원본은 항상 DB.** Redis에만 있는 중요한 데이터를 두지 않는다 |

### 1.3 실무에서 쓰는 곳

| 용도              | 방법                                   |
| ----------------- | -------------------------------------- |
| **조회 결과 캐시** | 결과를 JSON으로 저장 + TTL            |
| 로그인 세션 공유  | 서버 여러 대가 같은 세션을 봄          |
| 인증번호          | 3분 뒤 자동 삭제 (TTL)                 |
| 조회수, 좋아요 수 | `INCR`                                 |
| 중복 요청 방지, 락 | `SET NX`                              |

---

## 2. Redis 기본 명령어

설치는 Docker 한 줄이면 된다. 직접 따라 치는 실습은 [redis-cli 실습](./practice/redis-cli/README.md)에 있다.

```bash
docker run -d --name redis-study -p 6380:6379 redis:7.4
docker exec -it redis-study redis-cli
```

**실무에서 가장 많이 쓰는 명령**

| 명령                      | 뜻                                      | 쓰는 곳              |
| ------------------------- | --------------------------------------- | -------------------- |
| `SET 키 값 EX 초`         | 저장 + 자동 만료                        | **캐시의 기본형**    |
| `GET 키`                  | 조회 (없으면 `(nil)`)                   | 캐시 조회            |
| `DEL 키`                  | 삭제                                    | 캐시 무효화          |
| `TTL 키`                  | 남은 시간 (`-1` 만료 없음, `-2` 키 없음) | 확인용              |
| `INCR 키`                 | +1 (동시에 호출해도 안전)               | 조회수               |
| `SET 키 값 NX EX 초`      | 없을 때만 저장                          | 중복 방지, 락        |
| `HSET 키 필드 값` / `HGET 키 필드` | 객체를 필드별로 저장·조회      | 객체 일부 수정       |
| `SCAN 0 MATCH 패턴`       | 키 찾기 (`KEYS`는 운영 금지)            | 운영 중 확인         |

**키 이름 관례**: `종류:id:필드` (`user:1:name`, `post:1:views`). `:`은 Redis에게 의미 없는 그냥 글자이고, 이름만 봐도 무슨 데이터인지 알 수 있게 하는 **업계 관례**다. 자세한 내용은 [redis-cli 실습 1장](./practice/redis-cli/README.md#키-이름은-종류id필드로-짓는다).

---

## 3. 캐싱 전략

### 3.1 기본: Cache-Aside — 이것 하나만 확실히

**실무에서 가장 많이 쓰는 방식**이고, Spring의 `@Cacheable`이 이 방식이다.

```text
조회
 ① Redis에 있나?
    ├─ 있다(hit)  → 그대로 반환
    └─ 없다(miss) → ② DB 조회 → ③ Redis에 저장(TTL) → 반환
```

- 실제로 조회되는 데이터만 캐시에 올라간다.
- Redis가 죽어도 DB로 동작은 한다 (느려질 뿐).

### 3.2 데이터가 바뀌면 — "수정 시 삭제" + "TTL"

캐시는 DB의 **복사본**이라, DB가 바뀌면 캐시는 옛 값을 들고 있다. 두 가지로 막는다.

| 방법                     | 동작                                      | 역할                                  |
| ------------------------ | ----------------------------------------- | ------------------------------------- |
| **수정 시 캐시 삭제**    | DB를 수정하면서 캐시를 지운다 (`@CacheEvict`) | 다음 조회에서 새 값을 다시 캐싱   |
| **TTL**                  | 일정 시간이 지나면 자동 삭제              | 삭제를 놓쳐도 **최대 TTL만큼만** 틀림 |

**왜 수정할 때 캐시를 "새 값으로 갱신"하지 않고 "삭제"하나**: 동시에 두 번 수정하면 캐시에 쓰는 순서가 꼬여 옛 값이 남을 수 있다. 삭제하면 순서가 꼬여도 결과는 "캐시 없음"이라, 다음 조회가 DB의 최신 값을 가져온다.

### 3.3 다른 전략 — 이름만 알아 두기

| 전략              | 동작                                   | 언제                                    |
| ----------------- | -------------------------------------- | --------------------------------------- |
| Write-Through     | 쓸 때 DB와 캐시에 **같이** 저장        | 캐시가 항상 최신이어야 할 때            |
| Write-Behind      | 캐시에만 쓰고 DB는 **나중에 모아서**   | 조회수처럼 쓰기가 아주 많고, 조금 유실돼도 될 때 |

### 3.4 무엇을 캐싱하나

```text
✅ 읽기가 쓰기보다 훨씬 많다          상품 상세, 카테고리, 공지
✅ 조금 늦게 반영돼도 괜찮다          조회수, 랭킹
✅ 조회 비용이 크다                   여러 테이블 JOIN, 집계

❌ 항상 정확해야 한다                 잔액, 재고, 결제 상태
❌ 사용자마다 달라서 재사용이 없다
```

### 3.5 자주 나오는 문제

| 문제                | 상황                                                       | 대응                                  |
| ------------------- | ---------------------------------------------------------- | ------------------------------------- |
| **Cache Stampede**  | 인기 키의 TTL이 끝나는 순간, 요청이 한꺼번에 DB로 몰림    | TTL에 랜덤값을 섞어 만료 시점을 분산  |
| **Cache Penetration** | DB에도 없는 데이터를 계속 조회 → 매번 DB까지 감          | "없음"도 짧은 TTL로 캐싱              |

---

## 4. Spring Data Redis

**한 줄 요약**: Java 코드에서 Redis 명령을 보내는 라이브러리. **redis-cli에서 친 명령이 그대로 Java 메서드가 된다.**

### 4.1 설정 — 두 줄이면 끝

```groovy
implementation 'org.springframework.boot:spring-boot-starter-data-redis'
```

```properties
spring.data.redis.host=localhost
spring.data.redis.port=6380
```

이것만 있으면 Spring Boot가 Redis 연결과 `StringRedisTemplate`을 **Bean으로 자동 생성**한다 (2회차 Bean). 우리는 생성자로 주입받아 쓰기만 한다.

### 4.2 사용 — StringRedisTemplate

```java
@Service
@RequiredArgsConstructor
public class RedisBasicService {
    private final StringRedisTemplate redisTemplate;

    public void saveCode(String key, String code) {
        redisTemplate.opsForValue().set(key, code, Duration.ofMinutes(3));   // SET key code EX 180
    }
    public String getCode(String key) {
        return redisTemplate.opsForValue().get(key);                         // GET key
    }
    public Long increaseViews(Long postId) {
        return redisTemplate.opsForValue().increment("post:" + postId + ":views");   // INCR
    }
}
```

| Java                                   | Redis 명령 |
| -------------------------------------- | ---------- |
| `opsForValue().set(k, v, Duration)`    | `SET k v EX` |
| `opsForValue().get(k)`                 | `GET k`    |
| `opsForValue().increment(k)`           | `INCR k`   |
| `opsForValue().setIfAbsent(k, v, Duration)` | `SET k v NX EX` |
| `opsForHash().put(k, f, v)`            | `HSET k f v` |
| `delete(k)` / `getExpire(k)`           | `DEL k` / `TTL k` |

⚠️ **`StringRedisTemplate`을 기본으로 쓴다.** 그냥 `RedisTemplate`은 기본 설정이 Java 직렬화라서, redis-cli로 보면 키가 `"\xac\xed\x00\x05t..."`처럼 깨져 보인다.

실습: [Spring 실습 1](./practice/spring/README.md#1-stringredistemplate-기본) — API로 저장한 키가 redis-cli에서 그대로 보인다.

---

## 5. Spring Cache

**한 줄 요약**: 메서드에 `@Cacheable`을 붙이면, **3장의 Cache-Aside를 Spring이 대신** 해 준다. Redis 코드를 직접 쓰지 않는다.

### 5.1 사용법 — 3단계

```java
// ① 켜기 (설정 클래스에 한 번)
@EnableCaching
@Configuration
public class CacheConfig { ... }
```

```java
// ② 조회: 캐시에 있으면 메서드를 실행하지 않고 캐시 값을 반환
@Cacheable(cacheNames = "product", key = "#id")
public Product getProduct(Long id) {
    return productRepository.findById(id);
}

// ③ 수정: 메서드 실행 후 캐시 삭제
@CacheEvict(cacheNames = "product", key = "#id")
public Product updatePrice(Long id, int price) {
    return productRepository.updatePrice(id, price);
}
```

- Redis에 저장되는 키: **`캐시이름::key`** → `product::1`
- `#id`는 파라미터 `id`의 값이다.

### 5.2 TTL은 꼭 설정한다

기본값은 **TTL 없음**이라 캐시가 영원히 남는다. 실습 프로젝트의 `CacheConfig`는 TTL 10분 + JSON 저장으로 설정했다.

```java
RedisCacheConfiguration.defaultCacheConfig()
        .entryTtl(Duration.ofMinutes(10))
        .serializeValuesWith(SerializationPair.fromSerializer(new JacksonJsonRedisSerializer<>(Product.class)));
```

```text
127.0.0.1:6379> GET product::1
"{\"id\":1,\"name\":\"keyboard\",\"price\":50000}"
127.0.0.1:6379> TTL product::1
(integer) 600
```

### 5.3 실습 결과 — 조회에 1초 걸리는 "느린 DB"로 실험

| 요청          | 응답 시간 | 일어난 일                                  |
| ------------- | --------- | ------------------------------------------ |
| 1번째 조회    | **1.08초** | miss → DB 조회 → 캐시 저장               |
| 2번째 조회    | 24ms      | hit (메서드 실행 안 됨)                    |
| 3번째 조회    | 4ms       | hit                                        |
| 가격 수정     | 7ms       | DB 수정 + 캐시 삭제 (`product::1` 없어짐)  |
| 수정 후 조회  | **1.01초** | miss → **새 가격**으로 다시 캐싱         |

자세한 과정: [Spring 실습 2](./practice/spring/README.md#2-spring-cache--cacheable-cacheevict)

### 5.4 동작 원리와 주의점

`@Cacheable`은 3회차 `@Transactional`과 같은 **프록시** 방식이다.

```text
Controller → [캐시 프록시] → 실제 Service
              캐시에 있으면 여기서 바로 반환 (실제 메서드 호출 안 함)
```

- ⚠️ **같은 클래스 안에서 `this.getProduct()`로 부르면 캐시가 동작하지 않는다.** 프록시를 거치지 않기 때문이다 (`@Transactional`과 같은 함정).
- ⚠️ **TTL을 꼭 설정한다.**
- ⚠️ **정확해야 하는 데이터(잔액, 재고)에는 쓰지 않는다.**

---

## 요약

| 주제              | 꼭 기억할 것                                                      |
| ----------------- | ----------------------------------------------------------------- |
| Redis             | 서버 밖 메모리 Key-Value 저장소. **원본은 DB, Redis는 빠른 사본** |
| 핵심 명령         | `SET EX`, `GET`, `DEL`, `TTL`, `INCR`, `SET NX`                   |
| 캐싱 전략         | Cache-Aside + 수정 시 삭제 + TTL                                  |
| Spring Data Redis | `StringRedisTemplate` = Redis 명령의 Java 버전                    |
| Spring Cache      | `@Cacheable`(조회), `@CacheEvict`(수정). 프록시라 자기 호출 주의  |

---

## 확인 질문

### Q1. 캐시를 서버 메모리(HashMap)가 아니라 Redis에 두는 이유는?

<details><summary>답</summary>

서버가 여러 대면 HashMap은 서버마다 따로 있어서 값이 달라질 수 있고, 서버를 재시작하면 사라진다. Redis는 서버 밖에 있어서 모든 서버가 같은 값을 보고, 서버 재시작과 무관하게 유지된다.

</details>

### Q2. Cache-Aside 흐름과, 데이터를 수정할 때 캐시를 어떻게 처리하나?

<details><summary>답</summary>

조회 시 Redis를 먼저 보고, 있으면 반환하고 없으면 DB에서 읽어 Redis에 TTL과 함께 저장한 뒤 반환한다. 데이터를 수정하면 캐시를 갱신하지 않고 **삭제**한다(`@CacheEvict`). 동시 수정 시 순서가 꼬여도 다음 조회가 DB의 최신 값을 다시 읽기 때문이다. 삭제를 놓쳐도 TTL이 지나면 사라진다.

</details>

### Q3. 조회수를 `GET` → +1 → `SET`으로 올리면 안 되는 이유는?

<details><summary>답</summary>

명령이 두 개라서 그 사이에 다른 요청이 같은 값을 읽고 써서 증가분이 유실된다([8회차 실습](<../08회차(2026-10-21)/practice/spring/README.md>)에서 재고 차감으로 직접 확인). `INCR`은 명령 하나이고 Redis는 명령을 하나씩 처리하므로 동시에 호출해도 정확하다.

</details>

### Q4. `@Cacheable`이 동작하지 않는 대표적인 경우는?

<details><summary>답</summary>

같은 클래스 안에서 `this.getProduct()`처럼 직접 호출할 때다. `@Cacheable`은 프록시가 처리하는데, 자기 자신을 부르면 프록시를 거치지 않는다. `@Transactional`과 같은 이유다.

</details>
