# 0장. 실습 환경 준비

> **이 장을 마치면**: Redis를 띄우고, 두 가지 방법으로 Redis에 명령을 보낼 수 있다.
> ① `redis-cli`로 직접 치기 ② Spring Boot 앱에서 보내기

**준비물**: Docker Desktop(실행 중이어야 한다), Java 21, 실습 프로젝트 [redis-practice](./redis-practice)

---

## 1. 용어 먼저

| 용어 | 뜻 |
| ---- | -- |
| **Docker 컨테이너** | 프로그램을 내 PC에 설치하지 않고, 격리된 상자 안에서 실행하는 것. 이 실습의 Redis는 `redis-study`라는 컨테이너 안에서 돈다 |
| **redis-cli** | Redis에 명령을 직접 쳐서 보내는 프로그램. Redis와 함께 들어 있다 |
| **포트** | 한 컴퓨터에서 프로그램을 구분하는 번호. Redis 기본은 6379 |
| **Lettuce** | Java에서 Redis에 명령을 보내는 라이브러리. Spring Boot가 기본으로 쓴다 |
| **StringRedisTemplate** | Spring에서 Redis를 쓰는 도구. Redis 명령 하나 = Java 메서드 하나 |

## 2. Redis 띄우기

```bash
cd redis-practice
docker compose up -d          # 처음 한 번: redis-study 컨테이너를 만든다
```

다음부터는 이것만 하면 된다.

```bash
docker start redis-study
```

> 이 실습은 다른 프로젝트와 겹치지 않게 **내 PC의 6380번 포트**로 Redis에 연결한다 (컨테이너 안에서는 6379).

## 3. redis-cli로 접속해서 명령 쳐 보기

```bash
docker exec -it redis-study redis-cli
```

`docker exec -it 컨테이너 명령` = 그 컨테이너 안에서 명령을 실행하고, 내가 직접 입력할 수 있게 연결한다.

| 입력 | 결과 | 뜻 |
| ---- | ---- | -- |
| `PING` | `PONG` | Redis가 살아 있다 |
| `SELECT 1` | `OK` | 1번 DB로 이동. 프롬프트가 `127.0.0.1:6379[1]>`로 바뀐다 |
| `SET hello world` | `OK` | 저장 |
| `GET hello` | `"world"` | 조회 |
| `FLUSHDB` | `OK` | 지금 DB(1번)를 비운다 |
| `exit` | | 나가기 |

### 🔴 실습 규칙 — DB 번호

Redis 안에는 0~15번, 16개의 DB(데이터 공간)가 있다. 처음 접속하면 0번이다.

| 할 일 | 어디서 |
| ----- | ------ |
| **CLI로 명령 연습** | **1번 DB** — 접속하자마자 `SELECT 1` |
| **Spring 앱이 만든 키 확인** | **0번 DB** — 접속해서 `SELECT` 없이 바로 |

Spring 앱은 0번을 쓴다. 연습을 1번에서 하면 서로 섞이지 않는다. 앱이 만든 키를 1번에서 찾으면 `(nil)`(없음)이 나온다.

> `FLUSHDB`(지금 DB 비우기), `FLUSHALL`(전부 비우기)은 연습용이다. **운영 서버에서는 절대 쓰지 않는다.**

## 4. Spring Boot에서 Redis 쓰기

### 설정 — 이것만 있으면 된다

```groovy
// build.gradle
implementation 'org.springframework.boot:spring-boot-starter-data-redis'   // Redis (Lettuce 포함)
```

```yaml
# src/main/resources/application.yaml
server:
  port: 8083                 # 앱 포트
spring:
  data:
    redis:
      host: localhost
      port: 6380             # Redis 포트
      database: 0
      timeout: 3000          # Redis 응답을 최대 3초 기다린다
```

이 설정이 있으면 Spring Boot가 Redis 연결과 `StringRedisTemplate`을 **자동으로 만들어 준다.** 생성자로 받아서 쓰기만 한다.

### StringRedisTemplate 사용법

```java
@RestController
@RequiredArgsConstructor
public class PingController {

    private final StringRedisTemplate redisTemplate;   // 자동으로 만들어진 것을 주입받는다

    @GetMapping("/ping")
    public String ping() {
        return redisTemplate.execute(connection -> connection.ping(), true);   // Redis에 PING
    }
}
```

자료구조마다 꺼내 쓰는 메서드가 있다. 각 장에서 하나씩 쓴다.

| 자료구조 | 메서드 | 배우는 장 |
| -------- | ------ | --------- |
| String | `redisTemplate.opsForValue()` | 2장 |
| Hash | `redisTemplate.opsForHash()` | 3장 |
| List | `redisTemplate.opsForList()` | 3장 |
| Set | `redisTemplate.opsForSet()` | 3장 |
| Sorted Set | `redisTemplate.opsForZSet()` | 3장 |
| 키 삭제, 만료 | `redisTemplate.delete()`, `expire()` | 2장 |

## 5. 앱 실행해서 확인

**터미널 1** — 앱 실행 (로그가 계속 찍히며 터미널을 차지한다. IntelliJ에서 실행해도 된다)

```bash
cd redis-practice
./gradlew bootRun
```

**터미널 2** — 요청 보내기

| 요청 | 결과 |
| ---- | ---- |
| `curl localhost:8083/ping` | `PONG` |

> 코드를 바꾸면 앱을 껐다(`Ctrl+C`) 다시 켜야 반영된다.

## 6. Redis가 꺼지면 앱은 어떻게 되나

Redis에 문제가 생기면 Spring에서는 **예외**가 난다. 이 프로젝트는 그 예외를 한 곳에서 잡아 `503` 응답과 메시지를 준다.

```java
// common/RedisExceptionHandler.java
@RestControllerAdvice
public class RedisExceptionHandler {

    @ExceptionHandler({RedisConnectionFailureException.class, QueryTimeoutException.class})
    public ResponseEntity<Map<String, String>> handle(RuntimeException e) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("message", "Redis에 연결할 수 없습니다"));
    }
}
```

### 실습 — Redis를 껐다 켜 보기 (앱은 켜 둔 채로)

| 순서 | 명령 | 결과 |
| ---- | ---- | ---- |
| 1 | `docker stop redis-study` | Redis 꺼짐 |
| 2 | `curl localhost:8083/ping` | **3초 뒤** `{"message":"Redis에 연결할 수 없습니다"}` |
| 3 | `docker start redis-study` | Redis 켜짐 |
| 4 | `curl localhost:8083/ping` | `PONG` — 앱을 다시 켜지 않아도 자동으로 다시 연결된다 |

2번에서 3초를 기다린 이유가 `timeout: 3000`이다. 이 설정이 없으면 기본 **60초**를 기다린다. Redis가 죽었을 때 모든 요청이 60초씩 붙잡혀 서버 전체가 멈춘 것처럼 된다. 그래서 **timeout은 항상 짧게** 정한다.

> Redis가 **꺼진 상태로 앱을 시작**하면 앱이 아예 뜨지 않는다. 8장의 Stream 설정이 시작할 때 Redis에 접속하기 때문이다. Redis를 먼저 켠다.

## 7. 실습 프로젝트 구조

```text
redis-practice/src/main/java/com/buzz/redis/
  common/            /ping, Redis 에러 처리
  ch02string/        조회수, 인증번호
  ch03collection/    장바구니, 랭킹, 최근 본 상품, 좋아요
  ch04keys/          키 찾기와 지우기, 메모리 확인
  ch05cache/         캐시
  ch06concurrency/   재고 차감, 선착순 쿠폰
  ch07pipeline/      대량 저장
  ch08messaging/     서버 간 알림, 메시지 큐
src/main/resources/scripts/   Lua 스크립트 (6장)
```

API 주소는 `/ch02/...`, `/ch03/...`처럼 장 번호로 시작한다.

**실습 도구** ([infra/](./infra)): 길고 어려운 명령은 스크립트로 만들어 두었다. 각 장에서 안내한다.

> 시간(ms)이나 동시 요청 결과 숫자는 **실행할 때마다, PC마다 다르다.** 문서와 똑같지 않아도 된다. "몇 배 차이 나는가"를 본다.

---

## 🟢 참고 — 다른 프로젝트에서 `\xac\xed...` 같은 키를 보면

실무 코드에는 `StringRedisTemplate` 대신 `RedisTemplate<String, Object>`를 그대로 쓰는 곳이 있다. 그러면 Java 전용 저장 형식(Java 직렬화)으로 저장되어, redis-cli에서 이렇게 보인다.

```text
"\xac\xed\x00\x05t\x00\x0buser:1:name"
```

사람이 읽을 수 없다. 이 실습처럼 `StringRedisTemplate`을 쓰고, 객체는 JSON 문자열로 바꿔 저장하면 생기지 않는다 (5장).

## 면접 한 줄

- **Lettuce**: Spring Boot의 기본 Redis 클라이언트. 설정만 쓰면 연결과 `RedisTemplate`이 자동으로 만들어진다.
- **timeout**: Redis 장애 시 요청이 오래 붙잡히지 않도록 짧게 설정한다 (기본 60초).

다음: [1장. Redis란](./01-redis-basics.md)
