# 8회차(2026/10/21) 예습 — Spring MVC와 Redis 심화

- 이전 회차: [7회차 STUDY_GUIDE](<../07회차(2026-10-13)/STUDY_GUIDE.md>) (Cache, Redis 기초, Spring Cache)
- 실습: [Spring 실습 (mvc-redis-practice)](./practice/spring/README.md), [Lua 연습 문제 (redis-cli)](./practice/redis-cli/README.md)
- 설명 방식: 정의 → 왜 필요한가 → 동작 원리 → 실무 포인트

| 장 | 키워드                 |
| -- | ---------------------- |
| 1  | Spring MVC             |
| 2  | Redis Lua Script       |
| 3  | Redis Distributed Lock |
| 4  | Redis Pipeline         |
| 5  | Redis Pub/Sub          |

---

## 1. Spring MVC

### 1.1 전체 그림 — 요청 하나가 처리되기까지

```text
클라이언트 ── HTTP 요청 ──▶ ┌──────── Spring Boot 서버 (Java 프로세스 1개) ────────┐
                            │ Tomcat → 스레드 1개 배정 → DispatcherServlet → Controller │
클라이언트 ◀── JSON 응답 ── └──────────────────────────────────────────────────┘
```

| 이름                  | 한 줄                                                   |
| --------------------- | ------------------------------------------------------- |
| **Tomcat**            | HTTP 요청을 받아 주는 **웹 서버**                       |
| **스레드 풀**         | 요청을 실제로 처리할 **일꾼(스레드) 묶음**, 기본 최대 200개 |
| **DispatcherServlet** | 요청을 알맞은 **Controller에게 배달**하는 Spring의 입구  |

### 1.2 Tomcat과 Servlet

**Servlet**: Java에서 **HTTP 요청을 받아 응답을 만드는 표준 인터페이스**. 요청 객체(`HttpServletRequest`)를 받아 응답 객체(`HttpServletResponse`)를 채우는 규칙이다.

**Tomcat**: Servlet을 실행해 주는 프로그램(**Servlet Container**, WAS). 개발자 대신 다음을 한다.

1. 포트(8080)를 열고 TCP 연결을 받는다 (3회차 Socket)
2. HTTP 메시지(바이트)를 해석해 `HttpServletRequest` 객체로 만든다
3. **요청을 처리할 스레드를 배정**한다
4. Servlet이 채운 응답을 HTTP 메시지로 바꿔 보낸다

**Spring Boot에는 Tomcat이 내장**되어 있어서, 따로 설치하지 않아도 앱을 실행하면 포트가 열린다.

```text
Tomcat started on port 8081 (http) with context path '/'
```

### 1.3 🔴 Tomcat 스레드 풀 — 기본 최대 200개

**원리**: Tomcat은 요청마다 스레드를 새로 만들지 않는다. 미리 만들어 둔 **스레드 풀**에서 하나를 빌려주고, 응답이 끝나면 돌려받는다 (5회차 스레드 풀).

```text
요청 A ─▶ http-nio-8081-exec-1 ─┐
요청 B ─▶ http-nio-8081-exec-2 ─┤  응답이 끝나면 풀로 반납 → 다음 요청이 재사용
요청 C ─▶ http-nio-8081-exec-3 ─┘
```

- **요청 1개 = 스레드 1개.** Controller → Service → Repository → 응답까지 **같은 스레드 하나**가 처리한다 (4회차 ThreadLocal이 동작하는 이유).
- 스레드 이름 `http-nio-{포트}-exec-{번호}`는 로그에서 자주 보게 된다.

```properties
server.tomcat.threads.max=200        # 최대 스레드 수 (기본값)
server.tomcat.threads.min-spare=10   # 놀고 있어도 유지하는 최소 수 (기본값)
```

**왜 무제한이 아니라 200인가**

- 스레드 하나가 메모리(스택 약 1MB)를 쓴다. 200개면 스택만 약 200MB.
- 스레드가 코어 수보다 훨씬 많으면 CPU가 스레드를 바꾸는 데(컨텍스트 스위칭) 시간을 쓴다 (5·6회차).

**200개가 다 바쁘면**: 새 요청은 스레드가 빌 때까지 **기다린다** → 응답이 느려진다. 그래도 감당이 안 되면 연결이 거절된다.

실습: [Spring 실습 1](./practice/spring/README.md#1-tomcat-스레드-확인) — 동시 요청 5개에 서로 다른 스레드(`exec-7`, `exec-10`, `exec-1` …)가 배정된다.

### 1.4 Spring MVC와 DispatcherServlet

**MVC (Model-View-Controller)**: 웹 애플리케이션을 역할별로 나누는 패턴.

| 역할           | 하는 일                         |
| -------------- | ------------------------------- |
| **Controller** | 요청을 받아 로직(Service)을 호출 |
| **Model**      | 응답에 담을 데이터              |
| **View**       | 데이터를 화면(HTML)으로 그림    |

**Spring MVC**: 이 패턴을 Servlet 위에 구현한 Spring의 웹 프레임워크. JSON을 주고받는 **REST API**에서는 View(HTML) 대신 **객체를 JSON으로 변환**해서 응답한다 (`@RestController`).

#### DispatcherServlet — 모든 요청의 단일 입구

**정의**: Spring MVC가 Tomcat에 등록하는 **단 하나의 Servlet**. 모든 요청을 먼저 받아 알맞은 Controller에게 넘긴다. 이 구조를 **Front Controller 패턴**이라 한다.

**왜 입구를 하나로 두나**: Controller마다 Servlet을 따로 만들면 URL 매핑, 파라미터 변환, JSON 변환, 예외 처리 코드가 Controller마다 반복된다. 입구를 하나로 모으면 **공통 처리를 DispatcherServlet이 한 곳에서** 하고, Controller에는 비즈니스 로직만 남는다.

#### DispatcherServlet 내부 흐름

DispatcherServlet은 직접 일하지 않고 **역할별 부품에게 맡긴다.**

```text
GET /orders/1
   ▼
DispatcherServlet
 ① HandlerMapping        "GET /orders/{id}" → OrderController.getOrder() 찾기
 ② HandlerAdapter        찾은 메서드를 호출
     └ ArgumentResolver     "1" → @PathVariable Long id = 1
 ③ Controller 실행        → Map 반환
 ④ HttpMessageConverter  Map → {"status":"PAID","id":1} (JSON)
 ⑤ 응답
```

| 부품                     | 하는 일                               | 내가 쓰는 것                                     |
| ------------------------ | ------------------------------------- | ------------------------------------------------ |
| **HandlerMapping**       | URL + HTTP 메서드로 실행할 메서드 찾기 | `@GetMapping("/orders/{id}")`                    |
| **HandlerAdapter**       | 찾은 메서드 호출                      | (자동)                                           |
| **ArgumentResolver**     | 요청 값 → 메서드 파라미터 변환        | `@PathVariable`, `@RequestParam`, `@RequestBody` |
| **HttpMessageConverter** | Java 객체 ↔ JSON 변환                 | `@RestController` 반환값, `@RequestBody`         |

**실무에서 왜 알아야 하나** — 에러가 **어느 부품에서** 났는지 읽을 수 있다.

| 에러                                      | 어디서            | 흔한 원인                             |
| ----------------------------------------- | ----------------- | ------------------------------------- |
| `404 Not Found`                           | HandlerMapping    | URL 오타, GET/POST 틀림               |
| `400` + 변환 실패                         | ArgumentResolver  | `/orders/abc`처럼 숫자 자리에 문자    |
| `400` + `HttpMessageNotReadableException` | MessageConverter  | 요청 JSON 형식 오류                   |

### 1.5 🔴 Filter vs Interceptor — 공통 처리를 끼워 넣는 두 위치

**둘 다 모든 요청 앞뒤에 공통 처리(로그인 확인, 로그 등)를 끼워 넣는 기능**이다. 차이는 **위치**다.

```text
[ Servlet 컨테이너(Tomcat) 영역 ]   │   [ Spring MVC 영역 ]
Tomcat ─▶ [Filter] ─▶ DispatcherServlet ─▶ [Interceptor] ─▶ Controller
                      └ 경계(입구): Spring이 만든 Servlet
```

- **DispatcherServlet은 Spring MVC의 것**이다. Servlet 인터페이스를 구현해서 Tomcat에 Servlet으로 등록될 뿐, 그 안부터는 Spring MVC가 요청을 처리한다.
- **Filter는 Servlet 표준 기능**이라 DispatcherServlet **앞**(Spring MVC 처리 흐름 바깥)에서 실행된다. 단, `@Component`로 만들면 Spring이 Bean으로 만들어 Tomcat에 등록해 준다. "바깥"은 **Spring MVC 흐름 바깥**이라는 뜻이지 Spring과 무관하다는 뜻이 아니다.

|          | **Filter**                         | **Interceptor**                             |
| -------- | ---------------------------------- | ------------------------------------------- |
| 소속     | Servlet 표준                       | Spring MVC                                  |
| 위치     | DispatcherServlet **앞**           | DispatcherServlet **뒤**, Controller 앞     |
| 아는 것  | 요청과 응답만                      | **어떤 Controller 메서드가 실행될지**까지   |
| 주 용도  | 보안(Spring Security), 인코딩, CORS | 로그인 확인, 권한 체크, 실행 시간 측정      |

**선택 기준**: Spring과 무관하게 **모든 요청**에 적용 → Filter. **특정 URL이나 Controller 단위**로 적용 → Interceptor.

```java
// Interceptor: /orders/** 요청은 Authorization 헤더가 있어야 통과
public class LoginCheckInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (request.getHeader("Authorization") == null) {
            response.setStatus(401);
            return false;      // Controller까지 가지 않고 여기서 끝
        }
        return true;           // 다음 단계로
    }
}

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoginCheckInterceptor()).addPathPatterns("/orders/**");
    }
}
```

**실습 결과** ([Spring 실습 2](./practice/spring/README.md#2-filter--interceptor--controller-실행-순서))

```text
[exec-2] [Filter] 시작 /orders/1
[exec-2] DispatcherServlet : GET "/orders/1"
[exec-2] [Interceptor] preHandle → 실행할 메서드 = OrderController.getOrder()
[exec-2] [Controller] getOrder id=1
[exec-2] [Interceptor] afterCompletion status=200
[exec-2] [Filter] 끝 /orders/1
```

헤더 없이 요청하면 `preHandle`이 `false`를 반환해 **`[Controller]` 로그가 찍히지 않고** 401로 끝난다.

### 1.6 🔴 예외 처리 — `@RestControllerAdvice`

**문제**: Controller에서 처리되지 않은 예외가 나면 Spring Boot는 기본 에러 응답을 보낸다. 실습에서 `/orders/0`(잘못된 입력)을 요청한 결과다.

```json
{"timestamp":"2026-10-21T10:18:21.689Z","status":500,"error":"Internal Server Error","path":"/orders/0"}
```

잘못된 입력도 **500**이고, 무엇이 잘못됐는지 메시지도 없다.

**해결**: 예외 종류별로 응답을 **한 곳에서** 정한다.

```java
@RestControllerAdvice                       // 모든 Controller의 예외를 여기서 처리
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("code", "BAD_REQUEST", "message", e.getMessage()));
    }
}
```

적용 후 같은 요청:

```json
{"message":"주문 번호는 1 이상이어야 합니다","code":"BAD_REQUEST"}
```

- Controller와 Service에는 `try-catch` 없이 **예외를 던지기만** 한다.
- 에러 응답 형식이 서비스 전체에서 **하나로 통일**되어 프론트엔드가 처리하기 쉽다.
- ⚠️ `IllegalArgumentException` 같은 **범용 예외**를 잡으면 Spring 내부 예외까지 잡힌다. 실습에서 `/orders/abc`의 숫자 변환 실패가 이 핸들러에 걸려 내부 메시지 `For input string: "abc"`가 노출됐다. 실무에서는 **직접 만든 예외 클래스**(`BusinessException` 등)를 던지고 그것만 잡는다.

자세한 비교: [Spring 실습 3](./practice/spring/README.md#3-restcontrolleradvice--적용-전-vs-적용-후)

### 1.7 Spring MVC의 약점과 해결 방향

요청 1개가 스레드 1개를 **응답이 끝날 때까지** 붙잡는다.

```text
Controller가 느린 DB·외부 API를 기다림 → 스레드도 같이 기다림
→ 200개가 모두 기다리면 → 새 요청은 처리 불가 → 서비스가 멈춘 것처럼 보인다
```

그래서 MVC 서버 성능의 핵심은 **스레드가 기다리는 시간을 줄이는 것**이다.

- 자주 읽는 데이터는 DB 대신 **Redis 캐시**에서 읽는다 (7회차)
- 기다릴 필요 없는 일(이메일 발송 등)은 **메시지 큐**로 넘긴다 (1회차)
- 🟢 Java 21 **가상 스레드**(`spring.threads.virtual.enabled=true`)를 켜면 기다리는 동안 OS 스레드를 놓아줘서 이 한계가 크게 줄어든다

### 1장 요약

| 개념                    | 한 줄                                                                        |
| ----------------------- | ---------------------------------------------------------------------------- |
| Tomcat                  | Spring Boot에 내장된 웹 서버(Servlet Container). 요청을 받고 스레드를 배정  |
| 스레드 풀 200           | 요청 1개 = 스레드 1개. 다 차면 새 요청은 대기                                |
| Spring MVC              | Servlet 위의 웹 프레임워크. REST API는 객체를 JSON으로 응답                 |
| DispatcherServlet       | 모든 요청의 단일 입구(Front Controller). HandlerMapping → HandlerAdapter → MessageConverter |
| Filter / Interceptor    | DispatcherServlet 앞(보안, 인코딩) / 뒤(로그인 확인, 권한)                   |
| `@RestControllerAdvice` | 예외별 에러 응답을 한 곳에서 통일. 직접 만든 예외만 잡는다                  |
| 약점                    | 스레드가 기다리는 동안 점유 → 기다림을 줄이는 게 핵심                        |

---

## 2. Redis Lua Script

> **여러 Redis 명령을 하나로 묶어서, 중간에 아무도 끼어들 수 없게 한 번에 실행하는 것**

### 왜 필요한가

Redis는 명령 **하나**는 끊기지 않고 실행한다. 하지만 명령 **사이**에는 다른 서버가 끼어들 수 있다. 강사님 예제:

```text
서버 A: GET abc → 10                       SET abc 11
서버 B:          GET abc → 10   SET abc 11              → 두 번 더했는데 11 (하나 사라짐)
```

### 동작 — 묶어서 보내면 통째로 실행

```text
EVAL "스크립트" 키개수 키... 인자...
```

```lua
local v = tonumber(redis.call('GET', KEYS[1]) or '0')   -- 읽기
redis.call('SET', KEYS[1], v + 1)                       -- 쓰기
return v + 1
```

Redis는 이 스크립트 **전체를 명령 하나처럼** 실행한다. 도는 동안 다른 명령은 줄에서 기다리므로 중간에 끼어들 수 없다 (원자성 보장).

| 스크립트 안에서           | 뜻                     |
| ------------------------- | ---------------------- |
| `KEYS[1]` / `ARGV[1]`     | 넘겨준 키 / 넘겨준 값  |
| `redis.call('명령', ...)` | Redis 명령 실행        |

> ✍️ 문법 연습: [Lua 연습 문제 7개 (redis-cli)](./practice/redis-cli/README.md)

### `INCR`이 있는데 왜 Lua가 필요한가

| 하고 싶은 것                  | `DECR` 하나로                              | Lua로                  |
| ----------------------------- | ------------------------------------------ | ---------------------- |
| 재고 1 빼기                   | ✅                                         | ✅                     |
| **재고가 있을 때만** 1 빼기   | ❌ 확인을 못 해서 **0 밑으로 내려간다**    | ✅ `if`로 확인하고 뺀다 |

**"확인하고 실행"** 을 한 번에 하는 것이 Lua의 진짜 쓰임이다.

### 실습 결과

재고 50개에 주문 100건이 동시에 들어왔을 때 ([Spring 실습 4](./practice/spring/README.md#4-재고-동시-차감--get-set-vs-decr-vs-lua-vs-분산-락)):

| 방식                      | 남은 재고            |
| ------------------------- | -------------------- |
| `DECR`                    | **-50** (초과 판매)  |
| Lua (재고 있을 때만 차감) | **0** (정확히 50건)  |

### 주의 두 가지

| 주의                        | 이유                                                  |
| --------------------------- | ----------------------------------------------------- |
| **짧게 쓴다** (강사님 강조) | 스크립트가 도는 동안 **Redis 전체가 멈춘다**          |
| **롤백이 없다**             | 중간에 에러가 나도 앞에서 실행한 명령은 그대로 남는다 |

### 실무 한 줄

Spring에서는 `DefaultRedisScript`에 스크립트를 담고 `redisTemplate.execute(스크립트, 키 목록, 인자...)`로 실행한다.

### 🎯 감잡기 — 선착순 쿠폰 (1인 1장, 총 100장)

이벤트 쿠폰의 요구사항은 둘이다. **① 남은 수량이 있어야 하고 ② 이미 받은 사람은 또 못 받는다.** 확인 두 번과 저장 두 번을 한 번에 해야 하므로 Lua가 맞다.

```lua
-- KEYS[1] = 남은 수량, KEYS[2] = 받은 사람 목록(Set), ARGV[1] = 사용자
if redis.call('SISMEMBER', KEYS[2], ARGV[1]) == 1 then return -2 end   -- 이미 받음
local left = tonumber(redis.call('GET', KEYS[1]) or '0')
if left <= 0 then return -1 end                                       -- 매진
redis.call('DECR', KEYS[1])                                           -- 수량 차감
redis.call('SADD', KEYS[2], ARGV[1])                                  -- 받은 사람 기록
return left - 1                                                       -- 남은 수량
```

수량 2장으로 직접 쳐 보기 (`SELECT 1` 후):

```text
SET coupon:1:left 2
EVAL "..." 2 coupon:1:left coupon:1:users kim     → (integer) 1    ← 발급, 1장 남음
EVAL "..." 2 coupon:1:left coupon:1:users kim     → (integer) -2   ← 이미 받음
EVAL "..." 2 coupon:1:left coupon:1:users lee     → (integer) 0    ← 발급, 0장 남음
EVAL "..." 2 coupon:1:left coupon:1:users park    → (integer) -1   ← 매진
SMEMBERS coupon:1:users                           → kim, lee
```

한 줄로 붙여 넣을 스크립트:

```text
EVAL "if redis.call('SISMEMBER', KEYS[2], ARGV[1]) == 1 then return -2 end local left = tonumber(redis.call('GET', KEYS[1]) or '0') if left <= 0 then return -1 end redis.call('DECR', KEYS[1]) redis.call('SADD', KEYS[2], ARGV[1]) return left - 1" 2 coupon:1:left coupon:1:users kim
```

**동시성 확인**: 100장에 **300명이 30명씩 동시에** 요청 → 남은 수량 **0**, 받은 사람 **정확히 100명**.

---

## 3. Redis 분산 락 (Distributed Lock)

> **"지금 이 작업은 내가 하고 있다"는 표시를 Redis에 남겨서, 서버가 여러 대여도 한 번에 한 명만 작업하게 하는 것**

### 왜 필요한가

`synchronized`는 **서버 자기 메모리**에 락을 건다. 서버가 2대면 락도 2개라서 서로를 막지 못한다.

```text
서버 A: synchronized 통과 → 재고 1 확인 → 판매
서버 B: synchronized 통과 → 재고 1 확인 → 판매      → 1개를 2명에게 팔았다
```

그래서 **두 서버가 같이 보는 Redis**에 락을 둔다.

### 동작 — 딱 3단계

```text
① 잡기    SET lock:stock 내토큰 NX EX 3
② 작업    재고 확인 → 차감
③ 풀기    (내 토큰이면) DEL lock:stock
```

```text
서버 A: SET ... NX → OK      (락 획득)  → 작업 → DEL
서버 B: SET ... NX → (nil)   (이미 있음) → 잠깐 기다림 → 다시 SET → OK → 작업 → DEL
```

`NX`는 "키가 없을 때만 저장"이다. **먼저 온 한 명만 성공**하고 나머지는 기다린다. 이것이 락의 전부다.

### 자주 헷갈리는 것 — Redis에는 "락" 명령이 없다

평범한 `SET` 명령에 옵션 두 개를 붙여서 **락처럼 쓰는** 것이다.

```text
SET  lock:stock  token-A  NX  PX 30000
     └─ 키 이름 ─┘ └─ 값 ─┘ └ 잡기 ┘ └ 안전장치 ┘
```

| 조각         | 정체                                              | 락에서 맡는 역할                                   |
| ------------ | ------------------------------------------------- | -------------------------------------------------- |
| `lock:stock` | **그냥 키 이름.** `lock:`은 "락 용도 키"라는 표시(관례)일 뿐 | 무엇을 잠그는지 (`lock:stock:1`처럼 자원별로)  |
| `token-A`    | 값                                                | **누가 잡았는지** (풀 때 확인)                     |
| `NX`         | **N**ot e**X**ists — 키가 **없을 때만** 저장      | **잡기.** 여러 서버가 동시에 보내도 한 명만 `OK`   |
| `PX` / `EX`  | 만료 시간. `PX`는 밀리초, `EX`는 초 (`PX 30000` = `EX 30`) | **안전장치.** 잡은 서버가 죽어도 자동으로 풀림 |

- `EX`·`PX` 자체는 락이 아니다. 캐시(`SET product::1 ... EX 600`), 인증번호(`SET auth:code:1 ... EX 180`)에도 똑같이 쓰는 만료 옵션이다.
- `NX`가 없으면 B가 A의 값을 **덮어써서** 둘 다 락을 얻은 것처럼 된다.
- Java에서는 `redisTemplate.opsForValue().setIfAbsent(key, token, Duration)` — 이름 그대로 "없으면(if absent) 저장"이다.

> **`NX`가 "한 명만 잡게", `PX`/`EX`가 "잡은 채로 영원히 남지 않게". 둘을 합친 `SET ... NX PX`가 락이고, 풀 때는 "내 토큰일 때만 삭제"를 Lua로 한다.**

### 옵션이 붙는 이유

| 붙인 것                       | 없으면 생기는 일                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------- |
| **`EX 3`** (3초 뒤 자동 삭제) | 서버 A가 작업 중에 죽으면 락이 영원히 남아 **아무도 주문할 수 없다**             |
| **내 토큰** (풀 때 확인)      | A가 늦게 끝나 락이 이미 만료되고 B가 새로 잡았는데, A가 `DEL`하면 **B의 락을 지운다** |

"토큰 확인 → 삭제"는 명령 두 개라 그 사이에 끼어들 수 있으므로 **Lua로 묶는다** (2장).

### 실습 결과

재고 50개에 주문 100건이 동시에 들어와도 락을 쓰면 **남은 재고 0**, 정확히 50건만 팔린다. ([Spring 실습 4](./practice/spring/README.md#4-재고-동시-차감--get-set-vs-decr-vs-lua-vs-분산-락))

### Lua랑 뭐가 다른가

|                   | Lua               | 분산 락                          |
| ----------------- | ----------------- | -------------------------------- |
| 막을 수 있는 범위 | **Redis 안의 작업만** | **DB 저장, 외부 결제 API까지** |

Lua 스크립트 안에서는 MySQL을 부를 수 없다. "DB 재고 확인 → 주문 저장 → 결제"처럼 **Redis 밖의 일까지 한 번에 하나만** 해야 할 때 분산 락을 쓴다.

### 실무 한 줄

직접 만들기보다 **Redisson** 라이브러리를 쓴다. 작업이 길어지면 락 시간을 자동으로 늘려 주는 등 위의 문제들을 알아서 처리한다.

### 🎯 감잡기 — 터미널 2개로 "서버 2대" 흉내 내기

터미널 두 개를 열고 각각 `docker exec -it redis-study redis-cli` → `SELECT 1`. 왼쪽을 서버 A, 오른쪽을 서버 B라고 생각한다.

**① 동시에 주문 1번 결제를 처리하려고 한다**

```text
[A] SET lock:order:1 server-A NX EX 10    → OK         ← A가 락을 잡음
[B] SET lock:order:1 server-B NX EX 10    → (nil)      ← B는 실패 → 기다려야 함
[B] GET lock:order:1                      → "server-A" ← 누가 잡고 있는지 보임
```

**② A가 작업을 끝내고 자기 락을 푼다 → B가 잡는다**

```text
[A] EVAL "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0" 1 lock:order:1 server-A
                                          → (integer) 1   ← 해제
[B] SET lock:order:1 server-B NX EX 10    → OK            ← 이제 B 차례
```

**③ 왜 토큰이 필요한지 — A가 너무 늦게 끝난 경우**

```text
[A] SET lock:order:2 server-A NX EX 3     → OK
    (3초 넘게 기다린다 = A의 작업이 오래 걸림 → 락 자동 만료)
[B] SET lock:order:2 server-B NX EX 3     → OK            ← 만료됐으니 B가 잡음
[A] EVAL "...위와 같은 해제 스크립트..." 1 lock:order:2 server-A
                                          → (integer) 0   ← A는 B의 락을 못 지움 ✅
[B] GET lock:order:2                      → "server-B"
```

토큰 없이 그냥 `DEL lock:order:2`를 했다면 B의 락이 지워졌을 것이다. 직접 쳐 보면서 확인해 본다.

---

## 4. Redis Pipeline

> **명령을 하나 보내고 답을 기다리는 대신, 여러 개를 한꺼번에 보내고 답도 한꺼번에 받는 것**

### 왜 필요한가

Redis는 명령 자체는 아주 빨리 처리한다. 느린 것은 **오가는 시간(RTT, Round Trip Time)** 이다. 강사님 예제:

```text
INCR a  ──▶  ◀── 1
INCR a  ──▶  ◀── 2        명령 4개 = 왕복 4번
INCR a  ──▶  ◀── 3        Redis가 일한 시간보다 오가는 시간이 훨씬 길다
INCR a  ──▶  ◀── 4
```

### 동작 — 모아서 보내고, 모아서 받기

```text
INCR a, INCR a, INCR a, INCR a  ──▶
                                ◀──  1, 2, 3, 4        왕복 1번
```

Redis가 하는 일은 그대로다. **오가는 횟수만** 줄어든다.

### 실습 결과

| 실험                          | 하나씩        | 파이프라인         |
| ----------------------------- | ------------- | ------------------ |
| Spring, SET 1000번 ([실습 5](./practice/spring/README.md#5-pipeline--하나씩-vs-한-번에)) | 약 **450ms** | 약 **12ms** |
| redis-benchmark, SET 10만 번  | 초당 22만 건  | 초당 **227만 건**  |

### Lua랑 뭐가 다른가

|                              | Pipeline                         | Lua                         |
| ---------------------------- | -------------------------------- | --------------------------- |
| 목적                         | **빨리 보내기** (왕복 줄이기)    | **안 끼어들게** 실행 (원자성) |
| 중간에 다른 요청이 끼어드나  | ⭕ 끼어들 수 있다                | ❌ 못 끼어든다              |
| 앞 명령 결과로 다음을 정하기 | ❌ 결과는 마지막에 한꺼번에 온다 | ✅ `if`로 가능              |

"재고 있으면 차감"처럼 **앞 결과를 보고 판단**해야 하면 Pipeline으로는 안 되고 Lua를 쓴다. Pipeline은 **서로 관계없는 명령을 대량으로** 보낼 때 쓴다.

### 실무 한 줄

**캐시 미리 채우기**(서버 시작 시 인기 상품 수천 개를 Redis에 넣기)나 대량 저장·삭제에 쓴다. Spring에서는 `redisTemplate.executePipelined(...)`.

### 🎯 감잡기 — 상품 1만 개를 캐시에 미리 넣기

배포 직후에는 캐시가 비어 있어 첫 요청들이 전부 DB로 몰린다. 그래서 인기 데이터를 **미리 넣어 두는데**(캐시 워밍업), 이때 Pipeline을 쓴다.

```bash
# 1. 명령 1만 줄짜리 파일 만들기
for i in $(seq 1 10000); do echo "SET product:$i name-$i"; done > products.txt

# 2-1. 하나씩 보내기 (한 줄 보내고 답 기다리고 다음 줄)
time (docker exec -i redis-study redis-cli -n 1 < products.txt > /dev/null)

# 2-2. 파이프라인으로 보내기
time (docker exec -i redis-study redis-cli -n 1 --pipe < products.txt)
```

```text
하나씩:      1.081 total
--pipe:     0.071 total      errors: 0, replies: 10000
```

같은 1만 건인데 **약 15배** 빠르다. `-n 1`은 연습용 1번 DB다. 끝나면 `docker exec redis-study redis-cli -n 1 FLUSHDB`로 비운다.

---

## 5. Redis Pub/Sub

> **채널에 메시지를 보내면, 그 순간 그 채널을 듣고 있는 모두에게 바로 전달하는 방송**

### 왜 필요한가

서버가 여러 대일 때 **"모든 서버에게 한 번에 알려야 하는"** 일이 있다.

```text
서버 A에서 상품 1 가격 수정
→ 서버 A, B, C의 로컬 캐시(7회차 1장)에 옛 가격이 남아 있음
→ "상품 1 캐시 지워!"를 모든 서버에 알려야 함
```

서버마다 일일이 호출하려면 서로의 주소를 알아야 한다. Pub/Sub은 **채널 하나에 보내면 듣고 있는 모두가 받는다.**

### 동작 — 구독하고, 발행하기

```text
            SUBSCRIBE cache:invalidate      ← 서버 A, B가 채널을 "듣기 시작"
서버 C:     PUBLISH cache:invalidate product:1
                     │
         ┌───────────┴───────────┐
       서버 A                   서버 B          ← 동시에 받음
```

| 명령                  | 뜻                                                 |
| --------------------- | -------------------------------------------------- |
| `SUBSCRIBE 채널`      | 채널 듣기 시작 (그 연결은 메시지를 기다리는 상태가 된다) |
| `PUBLISH 채널 메시지` | 채널에 보내기. 결과 숫자 = **받은 구독자 수**      |

보내는 쪽은 누가 듣는지 몰라도 되고, 받는 쪽도 누가 보냈는지 몰라도 된다.

### 🔴 가장 중요한 특징 — 저장하지 않는다

| 상황                     | 결과                                          |
| ------------------------ | --------------------------------------------- |
| 구독 중인 서버           | ✅ 즉시 받는다                                |
| 그 순간 꺼져 있던 서버   | ❌ **영영 못 받는다.** 나중에 접속해도 안 온다 |
| 구독자가 아무도 없을 때  | 메시지는 그냥 사라진다 (`PUBLISH` 결과 `0`)   |

받았는지 확인(ACK)하는 기능도 없다. **보내고 끝 (Fire and Forget)**.

### 실습 결과

```text
구독자 2명일 때    PUBLISH cache:invalidate product:1  → 2   (둘 다 받음)
구독자 0명일 때    PUBLISH cache:invalidate product:2  → 0
그 뒤 새로 구독한 서버 → product:2는 받지 못함 (유실)
```

### Kafka(메시지 큐)랑 뭐가 다른가

|                    | Pub/Sub                       | Kafka (1회차 MQ)                       |
| ------------------ | ----------------------------- | -------------------------------------- |
| 메시지 저장        | ❌                            | ✅                                     |
| 꺼져 있다 켜진 서버 | 못 받는다                    | 밀린 것부터 받는다                     |
| 속도·설정          | 아주 가볍고 빠르다            | 무겁고 운영이 필요하다                 |
| 쓰는 곳            | **놓쳐도 괜찮은 실시간 알림** | **놓치면 안 되는 이벤트** (주문, 결제) |

7회차 카톡 vs 라인에서 메시지 저장에 Kafka를 쓴 이유가 이것이다. 채팅 내용은 놓치면 안 된다.

### 실무 한 줄

**로컬 캐시 무효화 방송**, 실시간 알림, "새 메시지 있음" 신호처럼 **놓쳐도 다음에 다시 맞춰지는** 일에 쓴다. 3장의 Redisson도 "락 풀렸다" 알림에 Pub/Sub을 쓴다.

### 🎯 감잡기 — 터미널 3개로 "캐시 지워" 방송하기

터미널 3개를 열고 각각 `docker exec -it redis-study redis-cli`로 접속한다.

**① 서버 A, B가 채널을 구독**

```text
[A] SUBSCRIBE cache:invalidate
[B] SUBSCRIBE cache:invalidate
```

두 터미널은 메시지를 기다리며 멈춘다.

**② 서버 C가 "상품 1 캐시 지워"를 방송**

```text
[C] PUBLISH cache:invalidate product:1    → (integer) 2    ← 2명이 받음
```

```text
[A], [B] 화면에 동시에:
1) "message"
2) "cache:invalidate"
3) "product:1"
```

실제 서버라면 이 메시지를 받은 순간 자기 로컬 캐시에서 `product:1`을 지운다.

**③ 유실 확인 — A, B를 `Ctrl+C`로 끄고 다시 방송**

```text
[C] PUBLISH cache:invalidate product:2    → (integer) 0    ← 아무도 못 받음
[A] SUBSCRIBE cache:invalidate            ← 다시 구독해도 product:2는 오지 않음
```

이것이 "저장하지 않는다"의 뜻이다.

---

## 8회차 전체 요약

| 장 | 주제              | 한 줄                                                                 | 언제 쓰나                                  |
| -- | ----------------- | --------------------------------------------------------------------- | ------------------------------------------ |
| 1  | Spring MVC        | Tomcat이 스레드(최대 200)를 주고, DispatcherServlet이 Controller로 배달 | 모든 API 요청의 기본 흐름                  |
| 2  | Lua Script        | 여러 명령을 묶어 끼어들 수 없게 한 번에 실행                          | Redis 안에서 "확인하고 실행" (재고, 쿠폰)  |
| 3  | 분산 락           | Redis에 "작업 중" 표시를 남겨 서버가 여러 대여도 한 명만 작업         | DB·외부 API까지 포함한 작업을 하나씩       |
| 4  | Pipeline          | 여러 명령을 한꺼번에 보내 왕복 횟수를 줄임 (원자성 없음)              | 대량 저장, 캐시 미리 채우기                |
| 5  | Pub/Sub           | 듣고 있는 모두에게 즉시 방송. 저장 안 함                              | 놓쳐도 되는 실시간 알림, 캐시 무효화 방송  |

**동시성 도구 고르는 순서** (2·3장)

```text
조건 없는 증감인가?           → INCR / DECR
Redis 안에서 끝나는 "확인 후 실행"? → Lua
DB·외부 API까지 포함하나?      → 분산 락
```
