# 5장. 캐싱

> **이 장을 마치면**: Redis를 가장 많이 쓰는 용도인 **캐시**를 직접 만들고(`StringRedisTemplate`), 같은 일을 애노테이션 한 줄로(`@Cacheable`) 할 수 있다. 캐시가 만료되는 순간 DB로 요청이 몰리는 문제도 막는다.

| 주제 | 한 줄 | 중요도 |
| ---- | ----- | ------ |
| Cache-Aside | 캐시에 없으면 DB에서 읽어 캐시에 넣는다. 수정하면 캐시를 지운다 | 🔴 매일 쓴다 |
| `@Cacheable` | 위 과정을 Spring이 대신 해 준다 | 🔴 |
| Cache Stampede | 캐시가 만료된 순간 요청이 한꺼번에 DB로 몰리는 문제 | 🔴 |

**실습 코드**: [ch05cache/](./redis-practice/src/main/java/com/buzz/redis/ch05cache)
**실습 준비물**: [infra/hit.sh](./infra/hit.sh) (같은 요청을 동시에 여러 번 보내는 스크립트)

---

## 1. 캐시란

> **캐시 = 느린 곳(DB)의 데이터를 빠른 곳(Redis)에 복사해 두고 다시 쓰는 것**

| 용어 | 뜻 |
| ---- | -- |
| **Hit** | 찾는 데이터가 캐시에 **있다** → 바로 돌려준다. DB에 안 간다 |
| **Miss** | 캐시에 **없다** → DB에서 가져오고, 다음을 위해 캐시에 넣어 둔다 |

**왜 효과가 있나**: 같은 데이터를 반복해서 읽기 때문이다. 인기 상품은 1분 안에 수천 명이 본다. DB에 수천 번 묻는 대신 **한 번만** 묻고 나머지는 Redis에서 준다.

| 캐시에 넣기 좋은 것 | 넣지 않는 것 |
| ------------------- | ------------ |
| 자주 읽고, 잘 안 바뀌고, 잠깐 옛날 값이어도 괜찮은 것 (상품 정보, 카테고리 목록) | 잠깐이라도 틀리면 안 되는 값 (잔액, 재고) |

## 2. 🔴 Cache-Aside — 가장 많이 쓰는 방식

> **앱이 캐시를 먼저 보고, 없으면 앱이 DB에서 읽어 캐시에 넣는다.** 실무에서 대부분 이 방식이다.

```text
[조회]
1. Redis에 GET product:1
   ├ 있다 (Hit)  → 바로 돌려준다. 끝
   └ 없다 (Miss) → 2번으로
2. DB에서 SELECT
3. Redis에 SET product:1 ... EX 60   ← TTL 60초
4. 돌려준다

[수정]
1. DB를 UPDATE
2. Redis에서 DEL product:1          ← 캐시를 지운다. 다음 조회 때 새 값으로 다시 채워진다
```

### 객체는 JSON 문자열로 넣는다

`StringRedisTemplate`은 문자열만 다룬다. 그래서 `Product` 객체를 **JSON 문자열**(`{"id":1,"name":"keyboard","price":10000}`)로 바꿔서 넣고, 꺼낼 때 다시 객체로 바꾼다. 바꾸는 도구는 Spring Boot에 들어 있는 `JsonMapper`다.

### 코드

```java
public record Product(Long id, String name, int price) { }
```

```java
// ManualCacheService.java
private static final Duration TTL = Duration.ofSeconds(60);

private String key(Long id) {
    return "product:" + id;
}

public Product getProduct(Long id) {
    String cached = redisTemplate.opsForValue().get(key(id));                 // 1. Redis에서 찾기
    if (cached != null) {
        return jsonMapper.readValue(cached, Product.class);                   //    Hit: JSON → 객체
    }
    Product product = db.findById(id);                                       // 2. Miss: DB에서
    if (product != null) {
        redisTemplate.opsForValue().set(key(id), jsonMapper.writeValueAsString(product), TTL);   // 3. 객체 → JSON, 60초
    }
    return product;
}

public Product updatePrice(Long id, int price) {
    Product updated = db.updatePrice(id, price);                             // 1. DB 수정
    redisTemplate.delete(key(id));                                           // 2. 캐시 삭제
    return updated;
}
```

`db`는 실습용 **가짜 DB**(`FakeProductDb`)다. 진짜 DB처럼 조회 한 번에 **0.2초** 걸리고, 몇 번 조회됐는지 센다.

### 🧪 실습 — DB에 몇 번 가는지 세어 보기

| 순서 | 요청 | 결과 | 확인할 것 |
| ---- | ---- | ---- | --------- |
| 1 | `curl -X POST localhost:8083/ch05/db-count/reset` | `reset` | DB 조회 횟수 0으로 |
| 2 | `curl -w " %{time_total}초\n" localhost:8083/ch05/manual/products/1` | `{...}` **0.25초** | Miss → DB에 갔다 |
| 3 | 2번을 한 번 더 | **0.02초** | Hit → Redis에서 |
| 4 | 2번을 한 번 더 | **0.004초** | Hit |
| 5 | `curl localhost:8083/ch05/db-count` | `{"select":1}` | 3번 조회했는데 DB는 **1번** |

Redis에 들어간 값 보기 (앱이 만든 키라 0번 DB):

```bash
docker exec -it redis-study redis-cli
```

| 입력 | 결과 |
| ---- | ---- |
| `GET product:1` | `"{\"id\":1,\"name\":\"keyboard\",\"price\":10000}"` |
| `TTL product:1` | `(integer) 52` (60 이하) |

가격을 바꾸면 캐시가 지워지는지 확인:

| 순서 | 요청 | 결과 | 확인할 것 |
| ---- | ---- | ---- | --------- |
| 1 | `curl -X PUT "localhost:8083/ch05/manual/products/1?price=15000"` | `{"id":1,"name":"keyboard","price":15000}` | |
| 2 | redis-cli에서 `EXISTS product:1` | `(integer) 0` | 캐시가 지워졌다 |
| 3 | `curl localhost:8083/ch05/manual/products/1` | `{...,"price":15000}` | 새 가격 |
| 4 | `curl localhost:8083/ch05/db-count` | `{"select":2}` | 새 값을 DB에서 다시 가져왔다 |

### 🔴 수정할 때 캐시를 "새 값으로 덮어쓰지" 않고 "지우는" 이유

두 요청이 거의 동시에 가격을 바꾸면, DB에 쓰는 순서와 캐시에 쓰는 순서가 엇갈릴 수 있다.

```text
요청 A: DB price=15000 ──────────────────────── 캐시에 15000 저장
요청 B:          DB price=17000 ── 캐시에 17000 저장
결과:   DB는 17000인데 캐시는 15000  ← 캐시가 틀렸다
```

지우기만 하면 다음 조회가 DB에서 최신 값을 읽어 온다. 그래서 **"DB 수정 → 캐시 삭제"** 순서가 기본이다. 그래도 아주 드물게 틀린 값이 들어갈 수 있는데, 그때는 **TTL이 지나면 저절로 바로잡힌다.** TTL이 최종 안전장치다.

## 3. 🔴 @Cacheable — 같은 일을 애노테이션으로

2절의 조회, 저장, 삭제 코드를 Spring이 대신 해 준다.

```java
// SpringCacheService.java
@Cacheable(cacheNames = "product-spring", key = "#id", unless = "#result == null")
public Product getProduct(Long id) {
    return db.findById(id);           // 캐시에 있으면 이 메서드는 아예 실행되지 않는다
}

@CacheEvict(cacheNames = "product-spring", key = "#id")
public Product updatePrice(Long id, int price) {
    return db.updatePrice(id, price); // 실행이 끝나면 캐시를 지운다
}
```

| 애노테이션 | 동작 |
| ---------- | ---- |
| `@Cacheable` | 캐시에 있으면 메서드를 **실행하지 않고** 캐시 값을 돌려준다. 없으면 실행하고 결과를 캐시에 저장 |
| `@CacheEvict` | 메서드 실행 후 캐시 삭제 |
| `key = "#id"` | 파라미터 `id`의 값으로 키를 만든다 |
| `unless = "#result == null"` | 결과가 null이면 저장하지 않는다 |

Redis에 저장되는 키 이름은 `캐시이름::key` → `product-spring::1`

### 설정 — TTL을 꼭 정한다

`@Cacheable`을 쓰려면 의존성 `spring-boot-starter-cache`와 아래 설정 클래스가 필요하다.

```java
@EnableCaching                  // @Cacheable 켜기
@Configuration
public class CacheConfig {

    @Bean
    public RedisCacheManagerBuilderCustomizer productCacheCustomizer() {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(60))                            // TTL 60초 (안 쓰면 TTL 없음!)
                .serializeValuesWith(SerializationPair.fromSerializer(
                        new JacksonJsonRedisSerializer<>(Product.class)));   // 값을 JSON으로 저장

        return builder -> builder.withCacheConfiguration("product-spring", config);   // 이 캐시에 적용
    }
}
```

> 설정 코드는 외우지 않아도 된다. **"TTL과 JSON 저장 형식을 정해 준다"** 는 것만 알고, 필요할 때 복사해서 쓴다. 저장 형식을 정하지 않으면 0장 참고의 `\xac\xed...`처럼 읽을 수 없는 값으로 저장된다.

### 🧪 실습

| 순서 | 요청 | 결과 | 확인할 것 |
| ---- | ---- | ---- | --------- |
| 1 | `curl -X POST localhost:8083/ch05/db-count/reset` | `reset` | |
| 2 | `curl -w " %{time_total}초\n" localhost:8083/ch05/spring/products/1` (3번) | 0.25초, 0.007초, 0.007초 | 첫 번째만 DB |
| 3 | `curl localhost:8083/ch05/db-count` | `{"select":1}` | |
| 4 | redis-cli에서 `GET product-spring::1` | `"{\"id\":1,...}"` | Spring이 만든 키 |
| 5 | `curl -X PUT "localhost:8083/ch05/spring/products/1?price=17000"` | `{...,"price":17000}` | |
| 6 | redis-cli에서 `EXISTS product-spring::1` | `(integer) 0` | `@CacheEvict`가 지웠다 |

### ⚠️ @Cacheable이 동작하지 않는 경우

`@Cacheable`은 Spring이 만든 **대리 객체(프록시)** 가 메서드 호출을 중간에서 가로채서 동작한다. `@Transactional`과 같은 방식이다.

```text
Controller → [Spring 대리 객체: 캐시 확인] → SpringCacheService.getProduct()
```

| 함정 | 이유 |
| ---- | ---- |
| **같은 클래스 안에서 `this.getProduct()`로 부르면 캐시가 안 된다** | 대리 객체를 거치지 않고 바로 호출된다 |
| `private` 메서드에 붙이면 안 된다 | 대리 객체는 밖에서 부르는 `public` 메서드만 가로챈다 |
| TTL을 안 정하면 영원히 남는다 | 기본값이 TTL 없음 |

---

## 4. 🔴 Cache Stampede — 만료되는 순간 DB로 몰린다

### 문제

인기 상품의 캐시가 만료된 **바로 그 순간** 요청 50개가 동시에 들어오면?

```text
요청 1  → 캐시 없음 → DB
요청 2  → 캐시 없음 → DB       ← 요청 1이 아직 캐시를 못 채웠다
...
요청 50 → 캐시 없음 → DB       → DB가 50번 맞는다
```

첫 요청이 DB에서 가져와 캐시를 채우기 **전에** 들어온 요청은 전부 DB로 간다. 이걸 **Cache Stampede**(캐시 쇄도)라고 한다.

### 해결 — 한 요청만 DB에 가게 한다

2장의 `SET NX EX`로 **"내가 DB 갔다 올게"** 표시(락)를 남긴다. `NX`라서 딱 한 요청만 성공한다.

```text
캐시 없음 → SET lock:product:1 {내 표시} NX EX 3
             ├ 성공 (1개)  → DB 조회 → 캐시 저장 → 표시 지우기
             └ 실패 (49개) → 0.05초 기다렸다가 캐시 다시 확인 → 이제 있다 (Hit)
```

`EX 3`은 DB에 간 요청이 중간에 죽어도 3초 뒤 표시가 저절로 사라지게 하는 안전장치다.

```java
public Product getProductWithLock(Long id) throws InterruptedException {
    String lockKey = "lock:" + key(id);
    String token = UUID.randomUUID().toString();                             // 내 표시 (나만 아는 값)

    for (int i = 0; i < 50; i++) {                                           // 최대 2.5초 기다린다
        String cached = redisTemplate.opsForValue().get(key(id));
        if (cached != null) {
            return jsonMapper.readValue(cached, Product.class);              // 캐시 있으면 끝
        }
        Boolean locked = redisTemplate.opsForValue().setIfAbsent(lockKey, token, LOCK_TTL);   // SET NX EX 3
        if (Boolean.TRUE.equals(locked)) {                                   // 내가 DB 담당
            try {
                String again = redisTemplate.opsForValue().get(key(id));     // 그사이 누가 채웠나 한 번 더 확인
                if (again != null) {
                    return jsonMapper.readValue(again, Product.class);
                }
                Product product = db.findById(id);
                if (product != null) {
                    redisTemplate.opsForValue().set(key(id), jsonMapper.writeValueAsString(product), TTL);
                }
                return product;
            } finally {
                redisTemplate.execute(UNLOCK_SCRIPT, List.of(lockKey), token);   // 내 표시일 때만 지운다
            }
        }
        Thread.sleep(50);                                                    // DB 담당이 아니면 잠깐 기다림
    }
    return db.findById(id);                                                  // 너무 오래 걸리면 DB로
}
```

> `UNLOCK_SCRIPT`는 "값이 내 표시일 때만 지우는" 짧은 Lua 스크립트다. 그냥 `DEL`하면 남의 표시를 지울 수 있어서 쓴다. **6장에서 자세히** 배운다. 지금은 "내 것만 지운다"로만 이해하면 된다.

### 🧪 실습 — 동시 요청 50개

`hit.sh`는 같은 요청을 **동시에** 여러 번 보내는 스크립트다: `./hit.sh 횟수 동시개수 METHOD 주소`

```bash
cd infra
```

**락 없이**

| 순서 | 명령 | 결과 |
| ---- | ---- | ---- |
| 1 | `curl -X DELETE localhost:8083/ch05/manual/products/2` | `evicted` (캐시 비우기 = 만료된 상황) |
| 2 | `curl -X POST localhost:8083/ch05/db-count/reset` | `reset` |
| 3 | `./hit.sh 50 50 GET localhost:8083/ch05/manual/products/2` | `요청 50번 보냄 (동시에 50개씩)` |
| 4 | `curl localhost:8083/ch05/db-count` | `{"select":50}` ← **DB 50번** |

**락 있게** (주소 끝에 `/locked`)

| 순서 | 명령 | 결과 |
| ---- | ---- | ---- |
| 1 | `curl -X DELETE localhost:8083/ch05/manual/products/2` | `evicted` |
| 2 | `curl -X POST localhost:8083/ch05/db-count/reset` | `reset` |
| 3 | `./hit.sh 50 50 GET localhost:8083/ch05/manual/products/2/locked` | |
| 4 | `curl localhost:8083/ch05/db-count` | `{"select":1}` ← **DB 1번** |

### 함께 쓰는 방법 — TTL을 조금씩 다르게

상품 1만 개를 한꺼번에 캐시에 넣으면서 전부 TTL 60초를 주면, 60초 뒤 1만 개가 **동시에** 만료된다. TTL에 랜덤 값을 더해 만료 시점을 흩뜨린다.

```java
Duration ttl = Duration.ofSeconds(60 + ThreadLocalRandom.current().nextInt(10));   // 60~69초
```

---

## 🟢 참고 — 다른 캐싱 방식

| 방식 | 한 줄 | 언제 |
| ---- | ----- | ---- |
| Write-Through | 쓸 때 캐시와 DB에 **동시에** 쓴다 | 캐시와 DB가 늘 같아야 할 때 (대신 쓰기가 느리다) |
| Write-Behind | 캐시에만 쓰고 DB에는 **나중에 모아서** 쓴다 | 조회수처럼 쓰기가 아주 많고 조금 잃어도 될 때 |

---

## 🎯 실습 문제

**문제 1.** `@Cacheable`로 카테고리 목록을 캐시했다. 카테고리 이름을 바꾸는 메서드에는 무엇을 붙여야 할까? 그리고 같은 클래스 안에서 `this.getCategories()`를 부르면 매번 DB에 간다. 왜일까?

<details>
<summary>정답</summary>

- 수정 메서드에는 `@CacheEvict`를 붙인다.
- `this.`로 부르면 Spring 대리 객체를 거치지 않아 `@Cacheable`이 동작하지 않는다. 다른 클래스(Controller나 다른 Service)에서 불러야 한다.

</details>

**문제 2.** 가격 수정 순서를 "캐시 삭제 → DB 수정"으로 바꾸면 무슨 일이 생길 수 있을까?

<details>
<summary>정답</summary>

캐시를 지운 직후, DB 수정이 끝나기 전에 다른 요청이 조회하면 → 캐시 없음 → **아직 안 바뀐 옛날 값**을 DB에서 읽어 다시 캐시에 넣는다. 그 뒤 DB가 바뀌어도 캐시에는 옛날 값이 TTL 동안 남는다. 그래서 DB를 먼저 바꾸고 캐시를 지운다.

</details>

**문제 3.** 4절 "락 없이" 실습에서 `./hit.sh 50 50 ...`을 `./hit.sh 50 5 ...`(동시에 5개씩)로 바꾸면 DB 조회 횟수가 어떻게 될까? 직접 해 보라.

<details>
<summary>정답</summary>

`{"select":5}` 정도로 줄어든다. 처음 동시에 들어간 5개만 DB에 가고, 그 뒤 요청들은 캐시가 채워진 뒤라 Hit이다. **동시에 몰리는 요청이 많을수록** Stampede가 커진다.

</details>

---

## 실무 주의

- 🔴 **캐시에는 항상 TTL.** 실수로 삭제를 빼먹어도 TTL이 지나면 바로잡힌다.
- 🔴 **수정할 때는 DB 먼저, 그다음 캐시 삭제.**
- Redis가 죽어도 서비스는 돌아가야 한다. 캐시가 없으면 DB에서 읽도록(느려질 뿐) 만든다.

## 면접 한 줄

- **Cache-Aside**: 캐시에 없으면 애플리케이션이 DB에서 읽어 캐시에 넣는다. 수정 시 DB를 바꾸고 캐시는 삭제한다.
- **@Cacheable**: 프록시가 메서드 호출을 가로채 캐시를 먼저 확인한다. 같은 클래스 내부 호출에는 적용되지 않는다.
- **Cache Stampede**: 캐시 만료 순간 요청이 DB로 몰리는 문제. `SET NX` 락으로 한 요청만 DB에 보내고, TTL에 랜덤 값을 더해 동시 만료를 피한다.

다음: [6장. 동시성](./06-concurrency.md)
