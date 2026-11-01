# 8회차(2026/10/21) — Redis 동시성·메시징 도구와 Spring 서버 흐름

- 예습 자료: [PRESTUDY.md](./PRESTUDY.md) (개념 설명과 감잡기 실습이 자세히 있다)
- 수업 메모 원본: [source-materials/class-memo.md](./source-materials/class-memo.md)
- 실습: [Spring 실습 (mvc-redis-practice)](./practice/spring/README.md), [Lua 연습 문제 (redis-cli)](./practice/redis-cli/README.md)

이 문서는 **실제 수업 순서**대로 핵심만 다시 묶은 복습용이다. 자세한 설명은 각 장의 PRESTUDY 링크를 따라간다.

---

## 오늘의 핵심 한 문장

> **서버가 여러 대일 때 Redis를 "공용 칠판"으로 써서 동시에 하나만 작업하게 하고(분산 락, Lua), 빠르게 보내고(Pipeline), 모두에게 알린다(Pub/Sub). 그 요청은 Tomcat 스레드 하나가 처음부터 끝까지 처리한다.**

## 전체 그림

```text
클라이언트
   │ HTTP
   ▼
┌──────────────── Spring Boot 서버 (여러 대) ────────────────┐
│ Tomcat → 스레드 1개 → Filter → DispatcherServlet → Controller │
│                                         │                  │
│                                         ▼                  │
│                               Service ── Redis ───────────┼── 다른 서버들도 같은 Redis를 본다
└─────────────────────────────────────────┼──────────────────┘
                                          │
     분산 락   SET NX PX           → 한 번에 한 서버만 작업
     Lua       EVAL                → 여러 명령을 끼어들 수 없게 한 번에
     Pipeline  executePipelined    → 여러 명령을 왕복 1번에
     Pub/Sub   PUBLISH/SUBSCRIBE   → 듣고 있는 모든 서버에 방송
```

| 수업 순서 | 주제 | 한 줄 |
| -- | ---- | ----- |
| 1 | 분산 락 | `SET NX` + 만료 시간. **lock timeout을 꼭 신경 쓴다** |
| 2 | Pub/Sub | at-most-once (유실 가능) vs Kafka at-least-once (중복 가능) |
| 3 | Lua Script | GET → +1 → SET을 원자적으로 묶는 커스텀 명령. 오래 걸리면 장애 |
| 4 | Pipeline | `executePipelined`로 왕복 횟수 줄이기 |
| 5 | Spring 서버 전체 흐름 | Tomcat이 연결을 받고 스레드를 배정, DispatcherServlet이 Controller로 배달 |

---

## 1. 분산 락 (Distributed Lock)

> 자세히: [PRESTUDY 3장](./PRESTUDY.md#3-redis-분산-락-distributed-lock)

### 핵심 명령어 — `SET NX`

```text
SET lock:order:1 내토큰 NX PX 30000
```

| 조각 | 역할 |
| ---- | ---- |
| `NX` | 키가 **없을 때만** 저장 → 동시에 시도해도 한 서버만 성공 = 락 획득 |
| `PX 30000` | 30초 뒤 자동 삭제 = **lock timeout** |
| `내토큰` | 풀 때 "내가 잡은 락인지" 확인용 |

`synchronized`는 서버 자기 메모리에만 락을 건다. 서버가 2대면 서로를 막지 못하므로 **두 서버가 같이 보는 Redis**에 락을 둔다.

### 🔴 lock timeout — 강사님이 "꼭 신경 써야 한다"고 한 부분

만료 시간은 **짧아도 길어도** 문제가 된다.

| 설정 | 생기는 일 |
| ---- | --------- |
| 만료 시간 없음 | 락을 잡은 서버가 죽으면 락이 **영원히** 남는다. 아무도 그 작업을 못 한다 |
| 너무 짧음 | 작업이 끝나기 전에 락이 풀린다 → 다른 서버가 락을 잡고 **같은 작업을 동시에** 한다 → 락이 의미 없어짐 |
| 너무 김 | 서버가 죽었을 때 락이 풀릴 때까지 다른 서버가 **오래 기다린다** |

그리고 짧아서 만료된 경우에는 문제가 하나 더 있다.

```text
A: 락 획득 (3초) → 작업이 5초 걸림 ... 3초에 락 만료
B:                           락 획득 → 작업 중
A: 작업 끝 → DEL lock  ← B의 락을 지워 버림
```

그래서 풀 때는 **"값이 내 토큰일 때만 삭제"** 를 Lua로 한 번에 한다 (확인과 삭제 사이에 끼어들지 못하게).

### 클라이언트 구현체 — Redisson

위 문제를 직접 다 처리하기는 어렵다. 실무에서는 **[Redisson](https://github.com/redisson/redisson)** 라이브러리를 쓴다.

| 직접 구현하면 신경 쓸 것 | Redisson이 해 주는 것 |
| ------------------------ | --------------------- |
| 작업이 길어져 락이 먼저 만료됨 | **Watchdog**: 작업 중이면 만료 시간을 자동으로 연장 (기본 30초 락을 주기적으로 갱신) |
| 락을 기다리는 서버가 계속 `SET NX`를 재시도 (Redis 부하) | Pub/Sub으로 "락 풀렸다" 알림을 받고 그때 재시도 |
| 남의 락 삭제 | 스레드 단위로 소유자를 확인하고 해제 |

```java
// Redisson 사용 형태 (이번 실습 프로젝트에는 넣지 않았다)
RLock lock = redissonClient.getLock("lock:order:1");
if (lock.tryLock(5, TimeUnit.SECONDS)) {     // 최대 5초 기다리며 락 시도, 만료는 Watchdog이 관리
    try {
        // 재고 확인 → 주문 저장 → 결제
    } finally {
        lock.unlock();
    }
}
```

### 실습 결과

재고 50개에 주문 100건이 동시에 들어와도 분산 락을 쓰면 남은 재고 **0**, 정확히 50건만 팔렸다. ([Spring 실습 4](./practice/spring/README.md#4-재고-동시-차감--get-set-vs-decr-vs-lua-vs-분산-락))

---

## 2. Pub/Sub — 레디스로 메시지 전달 vs 카프카로 메시지 전달

> 자세히: [PRESTUDY 5장](./PRESTUDY.md#5-redis-pubsub)
> 수업 링크: [Message Brokers (VMware)](https://www.vmware.com/topics/message-brokers), [Redis Publish Subscribe (GeeksforGeeks)](https://www.geeksforgeeks.org/redis-publish-subscribe/)

**메시지 브로커**: 메시지를 보내는 쪽과 받는 쪽 사이에서 메시지를 전달해 주는 중간 시스템이다. 보내는 쪽은 받는 쪽의 주소를 몰라도 된다. Redis Pub/Sub과 Kafka 모두 메시지 브로커로 쓸 수 있다. 차이는 **전달 보장**이다.

### 🔴 전달 보장 3가지

| 보장 | 뜻 | 실패하면 | 대표 |
| ---- | -- | -------- | ---- |
| **at-most-once** (최대 한 번) | 보내고 끝. 확인 안 함 | **유실** 가능, 중복은 없음 | Redis Pub/Sub |
| **at-least-once** (최소 한 번) | 받았다는 확인(ACK)이 올 때까지 다시 보냄 | 유실은 없음, **중복** 가능 | Kafka (기본적인 사용) |
| exactly-once (정확히 한 번) | 유실도 중복도 없음 | 구현 비용이 크다 | Kafka 트랜잭션 등 특수 설정 |

**Redis Pub/Sub이 유실되는 이유**: 메시지를 저장하지 않는다. `PUBLISH` 순간 구독 중인 서버에만 전달되고, 그때 꺼져 있던 서버는 나중에 켜져도 못 받는다.

**Kafka가 중복되는 이유**: 메시지를 디스크에 저장하고, 소비자가 "여기까지 처리했다"를 기록(커밋)한다. 처리는 끝났는데 기록 직전에 서버가 죽으면, 다시 켜졌을 때 **같은 메시지를 또 받는다.**

```text
Kafka 소비자: 메시지 처리 (포인트 100 적립) → 서버 죽음 → 커밋 못 함
재시작:       같은 메시지 다시 받음 → 포인트 100 또 적립 ❌
```

그래서 at-least-once를 쓰면 받는 쪽을 **멱등(idempotent)** 하게 만든다. 같은 메시지를 두 번 처리해도 결과가 한 번 처리한 것과 같아야 한다. 예: 메시지 ID를 `SET processed:{id} 1 NX`로 기록하고, 이미 있으면 건너뛴다.

### 고르는 기준

| 상황 | 선택 |
| ---- | ---- |
| 놓쳐도 다음에 다시 맞춰지는 일 (로컬 캐시 무효화, 실시간 "새 글 있음" 신호) | Redis Pub/Sub |
| 놓치면 안 되는 일 (주문, 결제, 포인트, 채팅 저장) | Kafka (+ 멱등 처리) |

---

## 3. Lua Script

> 자세히: [PRESTUDY 2장](./PRESTUDY.md#2-redis-lua-script), 연습: [Lua 연습 문제](./practice/redis-cli/README.md)
> 수업 링크: [G마켓 기술 블로그](https://dev.gmarket.com/69)

### 수업 예제

```text
get abc
result = abc + 1
set abc result
```

명령이 3개라 **사이에 다른 서버가 끼어들 수 있다.** 두 서버가 동시에 `GET`으로 10을 읽고 각자 11을 쓰면, 두 번 더했는데 11이 된다.

이 3개를 **한 방에 묶어 실행하는 커스텀 명령**을 만드는 방법이 Lua Script다.

```lua
local v = tonumber(redis.call('GET', KEYS[1]) or '0')
redis.call('SET', KEYS[1], v + 1)
return v + 1
```

```text
EVAL "위 스크립트" 1 abc
```

Redis는 스크립트 전체를 **명령 하나처럼** 실행한다. 도는 동안 다른 명령은 기다리므로 끼어들 수 없다 → **원자성 보장**.

> 이 예제는 `INCR` 하나로도 된다. Lua가 진짜 필요한 건 **"재고가 있을 때만 차감"** 처럼 확인과 실행을 함께 해야 할 때다.

### 🔴 주의점 — 오래 걸리는 스크립트는 장애가 난다

Redis는 명령을 **한 번에 하나씩** 처리한다 (7회차 싱글 스레드). 스크립트가 1초 돌면 그 1초 동안 **모든 서버의 모든 Redis 요청이 멈춘다.** 캐시 조회, 세션 확인, 분산 락까지 전부 대기한다.

- 스크립트 안에서 큰 반복문, `KEYS *`, 수만 개 요소 조회를 하지 않는다.
- 스크립트에는 롤백이 없다. 중간에 에러가 나면 앞에서 실행한 명령은 그대로 남는다.

---

## 4. Pipeline

> 자세히: [PRESTUDY 4장](./PRESTUDY.md#4-redis-pipeline), 실습: [Spring 실습 5](./practice/spring/README.md#5-pipeline--하나씩-vs-한-번에)

명령을 하나 보내고 응답을 기다리는 대신, **여러 개를 한꺼번에 보내고 응답도 한꺼번에** 받는다. Redis가 하는 일은 같고 **네트워크 왕복(RTT) 횟수만** 줄어든다.

### `executePipelined` 사용해 보기

```java
List<Object> results = redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
    for (int i = 0; i < 1000; i++) {
        connection.stringCommands().set(("product:" + i).getBytes(), ("name-" + i).getBytes());
    }
    return null;   // 반드시 null. 결과는 executePipelined의 반환값으로 모아서 온다
});
```

| SET 1000번 | 걸린 시간 |
| ---------- | --------- |
| 하나씩 | 약 450ms |
| `executePipelined` | 약 12ms |

### Lua와 헷갈리지 않기

| | Pipeline | Lua |
| --- | --- | --- |
| 목적 | **빨리** 보내기 | **안 끼어들게** 실행 |
| 원자성 | ❌ 중간에 다른 요청이 끼어들 수 있다 | ✅ |
| 앞 결과로 다음 명령 결정 | ❌ | ✅ |
| 쓰는 곳 | 캐시 미리 채우기, 대량 저장·삭제 | 재고 차감, 쿠폰 발급, 락 해제 |

실습에서 막혔던 점: Spring Data Redis 4.x에서는 콜백의 `connection`을 `StringRedisConnection`으로 형변환하면 `ClassCastException`이 난다. 위처럼 `connection.stringCommands()`를 쓴다.

---

## 5. Spring 서버 전체 흐름과 Tomcat

> 자세히: [PRESTUDY 1장](./PRESTUDY.md#1-spring-mvc), 실습: [Spring 실습 1~3](./practice/spring/README.md)
> 수업 그림: [Spring - Tomcat](https://ibb.co/vxKdNp5j)

### 요청 하나가 응답이 되기까지

```text
① 클라이언트 → TCP 연결 → Tomcat (8080 포트)
② Tomcat: HTTP 메시지 해석 → HttpServletRequest 객체 생성
③ Tomcat: 스레드 풀에서 스레드 1개 배정  (http-nio-8080-exec-N)
④ Filter                      ← Servlet 표준 영역 (보안, 인코딩, CORS)
⑤ DispatcherServlet           ← Spring MVC의 단일 입구
⑥ Interceptor                 ← 로그인 확인, 권한
⑦ Controller → Service → Repository → DB / Redis
⑧ 반환값 → JSON 변환 (HttpMessageConverter)
⑨ 응답 전송 → 스레드를 풀에 반납
```

**④~⑨를 같은 스레드 하나가** 처리한다. 4회차 `@Transactional`이 ThreadLocal로 커넥션을 공유할 수 있는 이유가 이것이다.

### 🔴 Tomcat 서버 — 연결과 스레드는 다르다

Tomcat은 **연결을 받는 일**과 **요청을 처리하는 일**을 나눠서 한다.

```text
연결 받기 (Acceptor)  → 연결을 최대 max-connections(8192)개까지 유지
읽을 데이터 감시 (Poller) → 요청이 도착한 연결만 골라냄
요청 처리 (스레드 풀)  → 최대 threads.max(200)개 스레드가 실제 처리
```

| 설정 (Spring Boot 기본값) | 뜻 |
| ------------------------- | -- |
| `server.tomcat.threads.max=200` | 요청을 **동시에 처리하는** 스레드 최대 수 |
| `server.tomcat.max-connections=8192` | 동시에 **유지하는 연결** 최대 수 |
| `server.tomcat.accept-count=100` | 연결이 꽉 찼을 때 OS가 대기시키는 연결 수. 넘치면 연결 거절 |

연결 8192개가 있어도 **동시에 처리되는 건 200개**다. 나머지는 스레드가 빌 때까지 기다린다.

### 🔴 그래서 성능의 핵심은 "스레드가 기다리는 시간"

스레드는 DB나 외부 API 응답을 기다리는 동안에도 붙잡혀 있다. 느린 쿼리 하나에 200개 스레드가 모두 묶이면, CPU는 놀고 있어도 새 요청을 처리하지 못한다.

```text
느린 DB (2초) × 동시 요청 200개 → 스레드 200개 전부 대기 → 201번째 요청부터 줄 서기 → 응답 지연
```

- 자주 읽는 데이터는 Redis 캐시에서 읽는다 (7회차)
- 기다릴 필요 없는 일은 메시지 큐로 넘긴다
- 오늘 배운 Redis 도구들도 결국 **빠르게 끝내서 스레드를 빨리 돌려주는** 데 쓰인다

---

## 프론트엔드 경험과 연결되는 지점

| 프론트엔드 | 백엔드 (오늘) |
| ---------- | ------------- |
| 버튼 연타로 같은 API를 두 번 호출 → 버튼 비활성화로 막음 | 서버가 여러 대라 화면에서 막아도 동시에 들어온다 → **분산 락**으로 서버에서 막는다 |
| `Promise.all`로 요청을 한꺼번에 보내 기다리는 시간 줄이기 | **Pipeline**: 명령을 한꺼번에 보내 왕복 줄이기 |
| WebSocket으로 "새 메시지" 알림 받기 | 서버들끼리는 **Pub/Sub**으로 알림을 주고받는다 |
| 브라우저 메인 스레드가 무거운 연산으로 멈추면 화면 전체가 멈춤 | Redis도 스레드 하나라서 **Lua가 오래 돌면 모든 요청이 멈춤** |

## 실무에서 조심할 점

- 분산 락에는 **반드시 만료 시간**을 주고, 풀 때는 **내 토큰인지 확인**한다. 실무에서는 Redisson을 쓴다.
- Pub/Sub은 **유실된다.** 놓치면 안 되는 이벤트는 Kafka(또는 Redis Stream)를 쓰고, 받는 쪽을 멱등하게 만든다.
- Lua 스크립트는 **짧게.** 도는 동안 Redis 전체가 멈춘다.
- Pipeline은 **원자적이지 않다.** 대량 처리 속도용이다.
- Tomcat 스레드는 200개뿐이다. 느린 외부 호출에 **타임아웃**을 걸지 않으면 스레드가 전부 묶인다.

## 면접에서 말할 수 있는 문장

- **분산 락**: "여러 서버에서 같은 자원을 하나씩 처리해야 할 때 Redis `SET NX`에 만료 시간을 줘서 락을 겁니다. 만료가 없으면 서버 장애 시 락이 남고, 너무 짧으면 작업 중에 풀리기 때문에 실무에서는 Watchdog으로 만료를 연장해 주는 Redisson을 씁니다."
- **Pub/Sub vs Kafka**: "Redis Pub/Sub은 저장하지 않아 at-most-once로 유실될 수 있고, Kafka는 저장 후 커밋 기반이라 at-least-once로 유실은 없지만 중복이 생길 수 있어 소비자를 멱등하게 만듭니다."
- **Lua**: "여러 Redis 명령을 하나의 스크립트로 원자적으로 실행합니다. Redis가 싱글 스레드라 스크립트가 길면 전체 요청이 멈추므로 짧게 작성합니다."
- **Pipeline**: "여러 명령을 한 번에 보내 네트워크 왕복을 줄입니다. 원자성은 없어서 대량 저장 같은 독립적인 명령에 씁니다."
- **Tomcat**: "요청마다 스레드 풀의 스레드 하나가 Filter부터 Controller, 응답까지 처리합니다. 기본 최대 200개라 스레드가 I/O를 기다리는 시간을 줄이는 것이 처리량의 핵심입니다."

## 복습 질문

1. 분산 락의 만료 시간을 3초로 줬는데 작업이 5초 걸리면 무슨 일이 생기나?
2. 락을 풀 때 그냥 `DEL`하면 안 되는 이유는?
3. Kafka 소비자가 같은 메시지를 두 번 받을 수 있는 이유와 대응 방법은?
4. "재고가 있을 때만 차감"을 Pipeline으로 할 수 없는 이유는?
5. 연결이 8192개까지 가능한데 왜 동시에 처리되는 요청은 200개인가?

<details>
<summary>정답</summary>

1. 3초에 락이 만료되어 다른 서버가 락을 잡고 같은 작업을 동시에 한다. 락이 의미가 없어진다. Redisson Watchdog처럼 작업 중에는 만료를 연장해야 한다.
2. 내 락이 이미 만료되고 다른 서버가 새로 잡은 상태라면, 그 서버의 락을 지우게 된다. "값이 내 토큰일 때만 삭제"를 Lua로 원자적으로 한다.
3. 처리는 끝났는데 처리 위치를 커밋하기 전에 소비자가 죽으면, 재시작 후 같은 메시지를 다시 받는다 (at-least-once). 메시지 ID로 처리 여부를 기록해 두 번째는 건너뛰는 멱등 처리를 한다.
4. Pipeline은 결과를 마지막에 한꺼번에 받으므로 앞 명령(GET)의 결과를 보고 다음 명령(DECR)을 할지 정할 수 없다. 원자성도 없다. Lua를 쓴다.
5. 연결 유지(max-connections)와 요청 처리(threads.max)가 분리되어 있다. 연결은 많이 열어 둘 수 있지만, 실제 처리는 스레드 풀의 스레드(기본 200개)가 하므로 나머지는 스레드가 빌 때까지 기다린다.

</details>

## 다음 수업 (9회차)

- Redis Replication
- Redis Sentinel
- Redis Cluster

오늘 배운 도구들은 전부 **Redis 1대가 살아 있다는 전제**로 동작한다. 그 1대가 죽으면 락, 캐시, Pub/Sub이 모두 멈춘다. 다음 수업은 Redis를 여러 대로 구성해 이 문제를 푸는 방법이다. → [9회차 PRESTUDY](<../09회차(2026-10-30)/PRESTUDY.md>)
