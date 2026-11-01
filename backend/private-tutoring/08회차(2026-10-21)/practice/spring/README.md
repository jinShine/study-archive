# 8회차(2026/10/21) Spring 실습 — Spring MVC, 분산 락, Pipeline

- 프로젝트: [mvc-redis-practice](./mvc-redis-practice)
- 개념 설명: [PRESTUDY.md](../../PRESTUDY.md)
- 환경: Spring Boot 4.1.1, Java 21, Redis 7.4 (Docker)
- 아래 결과는 전부 직접 실행해서 얻은 값이다.

## 실습 목록

| 번호 | 실습                                | 확인할 것                                                          |
| ---- | ----------------------------------- | ------------------------------------------------------------------ |
| 1    | Tomcat 스레드 확인                  | 요청마다 `http-nio-8081-exec-N` 스레드가 배정된다                  |
| 2    | Filter → Interceptor → Controller   | 실행 순서, Interceptor가 Controller 실행을 막는 모습               |
| 3    | `@RestControllerAdvice`             | 적용 전(전부 500) vs 적용 후(400, 409 + 메시지)                    |
| 4    | 재고 동시 차감                      | GET→SET은 유실, DECR은 초과 판매, Lua·분산 락은 정확              |
| 5    | Pipeline                            | 1000번 왕복 vs 한 번에 보내기 시간 비교                            |

## 파일 구조

```text
mvc-redis-practice/
  compose.yaml                           Redis 컨테이너 (호스트 6380)
  src/main/resources/application.properties
  src/main/java/com/buzz/redis/
    MvcRedisPracticeApplication.java
    mvc/ThreadController.java            실습 1
    mvc/LogFilter.java                   실습 2: Filter
    mvc/LogInterceptor.java              실습 2: Interceptor (로그)
    mvc/LoginCheckInterceptor.java       실습 2: Interceptor (로그인 확인)
    mvc/WebConfig.java                   실습 2: Interceptor 등록
    mvc/OrderController.java             실습 2·3
    mvc/GlobalExceptionHandler.java      실습 3
    stock/StockService.java              실습 4: unsafe / atomic / lua / lock
    stock/RedisLock.java                 실습 4: SET NX PX + Lua 해제
    stock/StockController.java
    pipeline/PipelineService.java        실습 5
    pipeline/PipelineController.java
```

## 실행 방법

```bash
cd mvc-redis-practice

# 1. Redis 실행 (이미 redis-study 컨테이너가 있으면 docker start redis-study)
docker compose up -d

# 2. 앱 실행
./gradlew bootRun
```

`Tomcat started on port 8081`이 보이면 준비 완료.

> 포트: 8080은 다른 프로젝트가 쓰고 있어서 **8081**을 쓴다 (`server.port=8081`). Redis는 6379 충돌 때문에 **6380**이다.

---

## 1. Tomcat 스레드 확인

```java
@GetMapping("/thread")
public String thread() throws InterruptedException {
    String name = Thread.currentThread().getName();
    log.info("[Controller] 요청 처리 스레드 = {}", name);
    Thread.sleep(300);   // 동시 요청이 서로 다른 스레드를 받는 것을 보기 위해
    return name;
}
```

```bash
for i in 1 2 3 4 5; do curl -s -w '\n' localhost:8081/thread & done; wait
```

`&`는 curl을 백그라운드로 보내 5개를 **동시에** 실행하고, `wait`는 다 끝날 때까지 기다린다.

```text
http-nio-8081-exec-7
http-nio-8081-exec-10
http-nio-8081-exec-1
http-nio-8081-exec-8
http-nio-8081-exec-9
```

요청마다 **Tomcat 스레드 풀의 스레드**가 하나씩 배정됐다. 스레드 이름은 `http-nio-{포트}-exec-{번호}` 형식이다.

---

## 2. Filter → Interceptor → Controller 실행 순서

### 코드

```java
// Filter: DispatcherServlet 앞. @Component로 등록하면 모든 URL에 적용
@Component
public class LogFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws ... {
        log.info("[Filter] 시작 {}", uri);
        chain.doFilter(request, response);   // 다음 단계로 넘김
        log.info("[Filter] 끝 {}", uri);
    }
}
```

```java
// Interceptor: DispatcherServlet 뒤, Controller 앞. 실행할 메서드(handler)를 안다
public class LogInterceptor implements HandlerInterceptor {
    public boolean preHandle(..., Object handler) {
        log.info("[Interceptor] preHandle → 실행할 메서드 = {}", handlerName(handler));
        return true;
    }
    public void afterCompletion(..., Exception ex) {
        log.info("[Interceptor] afterCompletion status={}", response.getStatus());
    }
}

// /orders/** 는 Authorization 헤더가 없으면 401로 막는다
public class LoginCheckInterceptor implements HandlerInterceptor {
    public boolean preHandle(...) {
        if (request.getHeader("Authorization") == null) {
            response.setStatus(401);
            return false;   // Controller 실행 안 함
        }
        return true;
    }
}
```

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LogInterceptor()).addPathPatterns("/orders/**");
        registry.addInterceptor(new LoginCheckInterceptor()).addPathPatterns("/orders/**");
    }
}
```

### 실행 ① 정상 요청

```bash
curl -H 'Authorization: token' localhost:8081/orders/1
```

```text
{"status":"PAID","id":1}
```

앱 로그 (시간 생략):

```text
[nio-8081-exec-2] [Filter] 시작 /orders/1
[nio-8081-exec-2] DispatcherServlet : GET "/orders/1"
[nio-8081-exec-2] [Interceptor] preHandle → 실행할 메서드 = OrderController.getOrder()
[nio-8081-exec-2] [Controller] getOrder id=1
[nio-8081-exec-2] [Interceptor] afterCompletion status=200
[nio-8081-exec-2] DispatcherServlet : Completed 200 OK
[nio-8081-exec-2] [Filter] 끝 /orders/1
```

- 순서: **Filter → DispatcherServlet → Interceptor → Controller**, 돌아올 때는 반대 순서.
- Filter는 URI만 알지만, Interceptor는 **어떤 메서드(`OrderController.getOrder()`)가 실행될지** 안다.
- 처음부터 끝까지 **같은 스레드**(`exec-2`)다.

### 실행 ② Authorization 헤더 없이

```bash
curl -w '  [HTTP %{http_code}]\n' localhost:8081/orders/1
```

```text
  [HTTP 401]
```

```text
[nio-8081-exec-4] [Filter] 시작 /orders/1
[nio-8081-exec-4] DispatcherServlet : GET "/orders/1"
[nio-8081-exec-4] [Interceptor] preHandle → 실행할 메서드 = OrderController.getOrder()
[nio-8081-exec-4] [LoginCheck] Authorization 헤더 없음 → 401, Controller 실행 안 함
[nio-8081-exec-4] [Interceptor] afterCompletion status=401
[nio-8081-exec-4] DispatcherServlet : Completed 401 UNAUTHORIZED
[nio-8081-exec-4] [Filter] 끝 /orders/1
```

`[Controller]` 로그가 **없다.** `preHandle`이 `false`를 반환해 Controller까지 가지 않았다. Interceptor는 **등록한 순서대로** 실행된다(LogInterceptor → LoginCheckInterceptor).

---

## 3. `@RestControllerAdvice` — 적용 전 vs 적용 후

### 코드

```java
// Controller는 예외를 던지기만 한다
@GetMapping("/orders/{id}")
public Map<String, Object> getOrder(@PathVariable Long id) {
    if (id <= 0) throw new IllegalArgumentException("주문 번호는 1 이상이어야 합니다");
    if (id == 999) throw new IllegalStateException("이미 취소된 주문입니다");
    return Map.of("id", id, "status", "PAID");
}
```

```java
@RestControllerAdvice
@ConditionalOnProperty(name = "practice.exception-advice", havingValue = "true", matchIfMissing = true)
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("code", "BAD_REQUEST", "message", e.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleConflict(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("code", "CONFLICT", "message", e.getMessage()));
    }
}
```

`@ConditionalOnProperty`는 실습용이다. `--practice.exception-advice=false`로 실행하면 이 클래스가 등록되지 않아 **적용 전** 상태를 볼 수 있다.

### 적용 전

```bash
./gradlew bootRun --args='--practice.exception-advice=false'
```

```bash
curl -w '  [HTTP %{http_code}]\n' -H 'Authorization: token' localhost:8081/orders/0
curl -w '  [HTTP %{http_code}]\n' -H 'Authorization: token' localhost:8081/orders/999
curl -w '  [HTTP %{http_code}]\n' -H 'Authorization: token' localhost:8081/orders/abc
curl -w '  [HTTP %{http_code}]\n' localhost:8081/nothing
```

```text
{"timestamp":"2026-10-21T10:18:21.689Z","status":500,"error":"Internal Server Error","path":"/orders/0"}  [HTTP 500]
{"timestamp":"2026-10-21T10:18:21.712Z","status":500,"error":"Internal Server Error","path":"/orders/999"}  [HTTP 500]
{"timestamp":"2026-10-21T10:18:21.732Z","status":400,"error":"Bad Request","path":"/orders/abc"}  [HTTP 400]
{"timestamp":"2026-10-21T10:18:21.754Z","status":404,"error":"Not Found","path":"/nothing"}  [HTTP 404]
```

- 잘못된 입력(`0`)도, 비즈니스 규칙 위반(`999`)도 전부 **500**이다. 프론트엔드는 "서버가 고장났다"로밖에 알 수 없다.
- 메시지("주문 번호는 1 이상이어야 합니다")가 응답에 **없다.**
- `abc`(ArgumentResolver가 숫자로 못 바꿈) → 400, 없는 URL(HandlerMapping이 못 찾음) → 404는 Spring이 기본으로 처리한다.

적용 전 로그 — 예외가 DispatcherServlet 밖까지 올라가 Spring Boot의 `/error`로 다시 보내진다:

```text
[nio-8081-exec-6] [Controller] getOrder id=0
[nio-8081-exec-6] DispatcherServlet : Failed to complete request: java.lang.IllegalArgumentException: 주문 번호는 1 이상이어야 합니다
[nio-8081-exec-6] DispatcherServlet : "ERROR" dispatch for GET "/error"
[nio-8081-exec-6] DispatcherServlet : Exiting from "ERROR" dispatch, status 500
```

`[Filter] 끝` 로그가 없다. 처리되지 않은 예외가 Filter까지 그대로 뚫고 나갔기 때문이다.

### 적용 후

```bash
./gradlew bootRun
```

```text
{"message":"주문 번호는 1 이상이어야 합니다","code":"BAD_REQUEST"}  [HTTP 400]
{"message":"이미 취소된 주문입니다","code":"CONFLICT"}  [HTTP 409]
{"message":"For input string: \"abc\"","code":"BAD_REQUEST"}  [HTTP 400]
```

```text
[nio-8081-exec-3] [Controller] getOrder id=0
[nio-8081-exec-3] [Interceptor] afterCompletion status=400
[nio-8081-exec-3] DispatcherServlet : Completed 400 BAD_REQUEST
[nio-8081-exec-3] [Filter] 끝 /orders/0
```

- 예외 종류별로 **알맞은 상태 코드(400, 409)와 메시지**가 나간다. 응답 형식(`code`, `message`)도 통일됐다.
- 예외가 DispatcherServlet 안에서 처리되어 `/error`로 가지 않고, `[Filter] 끝`까지 정상 흐름으로 끝난다.

### ⚠️ 발견한 함정 — `abc`의 응답

`/orders/abc`가 내 `IllegalArgumentException` 핸들러에 걸려 **`For input string: "abc"`라는 내부 메시지가 그대로 노출**됐다.

- 원인: 숫자 변환 실패 예외(`MethodArgumentTypeMismatchException`)의 **원인(cause)** 이 `NumberFormatException`이고, 이것은 `IllegalArgumentException`의 하위 클래스다. Spring은 예외의 원인까지 따라가며 맞는 핸들러를 찾기 때문에 내 핸들러가 잡았다.
- 교훈: `IllegalArgumentException`처럼 **Java·Spring이 내부에서도 쓰는 범용 예외**를 핸들러로 잡으면 의도하지 않은 예외까지 잡힌다. 실무에서는 `OrderNotFoundException`, `BusinessException`처럼 **직접 만든 예외 클래스**를 던지고, 그것만 핸들러로 잡는다.

---

## 4. 재고 동시 차감 — GET-SET vs DECR vs Lua vs 분산 락

### 코드

```java
// ❌ GET → 계산 → SET (명령 2개)
private void readModifyWrite() {
    int stock = Integer.parseInt(redisTemplate.opsForValue().get(STOCK_KEY));
    if (stock > 0) {
        redisTemplate.opsForValue().set(STOCK_KEY, String.valueOf(stock - 1));
    }
}

// ✅ DECR 한 명령
public void decreaseAtomic() {
    redisTemplate.opsForValue().decrement(STOCK_KEY);
}

// ✅ Lua: 재고 확인과 차감을 한 번에
private static final RedisScript<Long> DECREASE_SCRIPT = new DefaultRedisScript<>(
        "local stock = tonumber(redis.call('GET', KEYS[1])) "
      + "if stock == nil or stock <= 0 then return -1 end "
      + "return redis.call('DECR', KEYS[1])",
        Long.class);

public Long decreaseWithLua() {
    return redisTemplate.execute(DECREASE_SCRIPT, List.of(STOCK_KEY));
}

// ✅ 분산 락으로 GET→SET 구간 보호
public void decreaseWithLock() throws InterruptedException {
    String token = UUID.randomUUID().toString();
    if (!redisLock.tryLock(LOCK_KEY, token, Duration.ofSeconds(3), Duration.ofSeconds(5))) {
        throw new IllegalStateException("락 획득 실패");   // 실습 3의 핸들러가 409로 응답
    }
    try {
        readModifyWrite();
    } finally {
        redisLock.unlock(LOCK_KEY, token);
    }
}
```

```java
// RedisLock
public boolean tryLock(String key, String token, Duration ttl, Duration wait) throws InterruptedException {
    long deadline = System.currentTimeMillis() + wait.toMillis();
    while (System.currentTimeMillis() < deadline) {
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(key, token, ttl);   // SET key token NX PX ttl
        if (Boolean.TRUE.equals(acquired)) {
            return true;
        }
        Thread.sleep(10);
    }
    return false;
}

public boolean unlock(String key, String token) {
    // Lua: if GET == token then DEL  (확인과 삭제를 한 번에)
    Long deleted = redisTemplate.execute(UNLOCK_SCRIPT, List.of(key), token);
    return deleted != null && deleted == 1L;
}
```

### 실행 ① — 재고 100개, 100번 차감, 20개씩 동시에

```bash
curl -X POST "localhost:8081/stock/reset?quantity=100"
seq 100 | xargs -P 20 -I{} curl -s -o /dev/null -X POST localhost:8081/stock/decrease/unsafe
curl localhost:8081/stock
```

`unsafe` 자리를 `atomic`, `lua`, `lock`으로 바꿔 반복한다. `xargs -P 20`은 curl을 **20개씩 동시에** 실행한다.

| 방식     | 남은 재고 (기대값 0)                         |
| -------- | -------------------------------------------- |
| `unsafe` | **57, 62, 65, 83, 74** (실행할 때마다 다름) |
| `atomic` | 0                                            |
| `lua`    | 0                                            |
| `lock`   | 0 (매번)                                     |

### 실행 ② — 재고 50개에 주문 100건 (재고보다 주문이 많을 때)

```bash
curl -X POST "localhost:8081/stock/reset?quantity=50"
seq 100 | xargs -P 20 -I{} curl -s -o /dev/null -X POST localhost:8081/stock/decrease/atomic
curl localhost:8081/stock
```

| 방식     | 남은 재고 (기대값 0) | 해석                                         |
| -------- | -------------------- | -------------------------------------------- |
| `unsafe` | 14, 26               | ❌ 유실                                      |
| `atomic` | **-50, -50**         | ❌ **초과 판매.** DECR은 0이어도 그냥 뺀다   |
| `lua`    | 0, 0                 | ✅ 재고가 0이면 -1을 반환하고 차감하지 않음  |
| `lock`   | 0, 0                 | ✅ 락 안에서 `stock > 0`을 확인              |

### 결과 해석

- **unsafe**: 두 요청이 **같은 재고 값을 읽고(GET)** 각자 1을 빼서 **같은 값을 쓰면(SET)** 하나가 유실된다. 6회차 `count++` 유실과 같은 구조이고, 무대가 CPU 레지스터 대신 **네트워크 너머의 Redis**일 뿐이다.
- **atomic**: `DECR`은 Redis 안에서 읽기+빼기+쓰기를 **명령 하나로** 처리해 유실은 없다. 하지만 **"0이면 멈춰"를 확인하지 못해** 재고가 부족하면 음수까지 내려간다(실행 ②).
- **lock**: GET→SET 구간 전체를 한 번에 한 요청만 실행한다. 6회차 `synchronized`와 같은 역할이지만 **락이 Redis에 있으므로 서버가 여러 대여도 통한다.**
- **lua**: "재고 확인 → 차감"을 Redis 안에서 **한 번에** 실행한다. DECR과 달리 조건을 넣을 수 있어 초과 판매가 없다.
- **원칙**: 조건 없는 증감은 `INCR/DECR`, Redis 안에서 끝나는 "확인 후 실행"은 Lua, DB·외부 호출까지 포함한 여러 단계는 분산 락.

---

## 5. Pipeline — 하나씩 vs 한 번에

```java
// 하나씩: SET 1번 = 왕복 1번
for (int i = 0; i < count; i++) {
    redisTemplate.opsForValue().set("pipe:single:" + i, "v");
}

// 파이프라인: 명령을 모아서 보내고 응답을 한꺼번에 받음
redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
    byte[] value = "v".getBytes(StandardCharsets.UTF_8);
    for (int i = 0; i < count; i++) {
        connection.stringCommands().set(("pipe:batch:" + i).getBytes(StandardCharsets.UTF_8), value);
    }
    return null;
});
```

```bash
curl "localhost:8081/pipeline/compare?count=1000"
```

```text
{"count":1000,"singleMillis":447,"pipelineMillis":22}
{"count":1000,"singleMillis":454,"pipelineMillis":13}
{"count":1000,"singleMillis":431,"pipelineMillis":12}
```

같은 SET 1000번이 **약 440ms → 약 12ms**. 첫 실행은 JIT 워밍업 영향으로 조금 느리다. 차이는 Redis가 일한 시간이 아니라 **네트워크 왕복(RTT) 횟수**에서 나온다.

---

## 막혔던 부분

### 8080 포트 충돌

다른 프로젝트가 8080에서 실행 중이라 앱이 뜨지 못했고, curl 요청이 **그 프로젝트로 가서 전부 404**가 났다. `lsof -nP -iTCP:8080 -sTCP:LISTEN`으로 확인 후 `server.port=8081`로 바꿨다.

### `StringRedisConnection` 형변환 에러 (Pipeline)

```text
java.lang.ClassCastException: class jdk.proxy2.$Proxy102 cannot be cast to class
org.springframework.data.redis.connection.StringRedisConnection
```

- 원인: `executePipelined` 콜백의 `connection`이 Spring Data Redis 4.x에서는 **프록시 객체**라 `StringRedisConnection`으로 형변환할 수 없다.
- 해결: 형변환 없이 `connection.stringCommands().set(byte[], byte[])` 사용.

## 다음에 다시 볼 질문

- 락의 TTL(3초)보다 작업이 오래 걸리면 무슨 일이 생길까?
- Filter에서 예외가 나면 `@RestControllerAdvice`가 잡을 수 있을까? (힌트: 위치)
