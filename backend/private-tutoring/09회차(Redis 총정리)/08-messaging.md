# 8장. 메시징 — Pub/Sub과 Stream

> **이 장을 마치면**: 서버 여러 대에 한 번에 알리는 방법(Pub/Sub)을 만들고, 메시지가 **사라지는 방식**과 **남는 방식**(Stream)의 차이를 설명할 수 있다.

| 주제 | 한 줄 | 중요도 |
| ---- | ----- | ------ |
| Pub/Sub | 듣고 있는 모두에게 즉시 방송한다. 저장하지 않는다 | 🟡 |
| 전달 보장 | 사라질 수 있나(at-most-once), 두 번 올 수 있나(at-least-once) | 🔴 개념 |
| Stream | 메시지를 저장하고, 처리 완료를 확인하는 큐 | 🟡 개념 + 짧은 실습 |

**실습 코드**: [ch08messaging/](./redis-practice/src/main/java/com/buzz/redis/ch08messaging)

---

## 1. 🟡 Pub/Sub — 서버 여러 대에 방송하기

### 왜 필요한가

서버가 3대이고, 각 서버가 **자기 메모리에 상품 정보를 캐시**(로컬 캐시)해 두었다고 하자.

```text
서버 A에서 상품 1 가격 수정
→ 서버 A, B, C의 메모리에 옛 가격이 남아 있다
→ 모든 서버에 "상품 1 캐시 지워!"라고 알려야 한다
```

서버마다 API를 호출하려면 서로의 주소를 다 알아야 한다. Pub/Sub은 **채널**(방송 채널 이름)에 한 번 보내면, 그 채널을 **듣고 있는 모두**가 받는다.

| 용어 | 명령 | 뜻 |
| ---- | ---- | -- |
| 구독 (Subscribe) | `SUBSCRIBE 채널` | 채널을 듣기 시작한다 |
| 발행 (Publish) | `PUBLISH 채널 메시지` | 채널에 보낸다. 결과 = **받은 구독자 수** |

### 🧪 따라 치기 — 터미널 3개

터미널 3개를 열고 각각 `docker exec -it redis-study redis-cli`로 접속한다. A, B, C를 서버 3대라고 생각한다.

**1단계. A, B가 구독**

| 터미널 | 입력 | 결과 |
| ------ | ---- | ---- |
| A | `SUBSCRIBE cache:invalidate` | `Reading messages... (press Ctrl-C to quit)`<br>`1) "subscribe" 2) "cache:invalidate" 3) (integer) 1` |
| B | `SUBSCRIBE cache:invalidate` | (A와 같음) |

A, B는 메시지를 기다리며 멈춘다 (다른 명령을 칠 수 없는 상태).

**2단계. C가 발행**

| 터미널 | 입력 | 결과 | 확인할 것 |
| ------ | ---- | ---- | --------- |
| C | `PUBLISH cache:invalidate product:1` | `(integer) 2` | 2명이 받았다 |
| A, B 화면 | | `1) "message"`<br>`2) "cache:invalidate"`<br>`3) "product:1"` | 동시에 도착 |

**3단계. 사라지는 것 확인** — A, B를 `Ctrl+C`로 끄고:

| 터미널 | 입력 | 결과 | 확인할 것 |
| ------ | ---- | ---- | --------- |
| C | `PUBLISH cache:invalidate product:2` | `(integer) 0` | 아무도 못 받았다 |
| A | `SUBSCRIBE cache:invalidate` | (구독 메시지만 나온다) | 다시 들어도 product:2는 **오지 않는다** |

> Pub/Sub은 메시지를 **저장하지 않는다.** 보내는 순간 듣고 있던 사람에게만 가고 끝이다.

### 🧪 Spring — 서버 2대로 캐시 무효화

```java
// ① 받는 쪽: 메시지(키 이름)가 오면 이 서버의 로컬 캐시에서 지운다
@Component
public class CacheInvalidateListener implements MessageListener {

    private final Map<String, String> localCache = new ConcurrentHashMap<>();   // 서버마다 따로 있는 캐시

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String key = new String(message.getBody(), StandardCharsets.UTF_8);
        localCache.remove(key);
    }
}
```

```java
// ② 구독 등록: "cache:invalidate 채널은 CacheInvalidateListener가 듣는다"
@Bean
public RedisMessageListenerContainer redisMessageListenerContainer(
        RedisConnectionFactory connectionFactory, CacheInvalidateListener listener, ChatListener chatListener) {
    RedisMessageListenerContainer container = new RedisMessageListenerContainer();
    container.setConnectionFactory(connectionFactory);
    container.addMessageListener(listener, new ChannelTopic("cache:invalidate"));   // SUBSCRIBE
    container.addMessageListener(chatListener, new PatternTopic("chat:room:*"));     // 패턴 구독 (chat:room:1, 2 ...)
    return container;
}
```

```java
// ③ 보내는 쪽
Long receivers = redisTemplate.convertAndSend("cache:invalidate", key);   // PUBLISH
```

**1단계. 서버 2대 띄우기** — 앞 장에서 띄운 앱은 먼저 끈다(`Ctrl+C`). 안 끄면 8083 포트가 이미 쓰는 중이라 뜨지 않는다.

```bash
# 터미널 1
./gradlew bootRun --args='--server.port=8083'
# 터미널 2
./gradlew bootRun --args='--server.port=8084'
```

**2단계. 터미널 3에서 요청**

| 순서 | 요청 | 결과 | 확인할 것 |
| ---- | ---- | ---- | --------- |
| 1 | `curl -X POST "localhost:8083/ch08/pubsub/local-cache/product:1?value=keyboard"` | | 8083 캐시에 넣기 |
| 2 | `curl -X POST "localhost:8083/ch08/pubsub/local-cache/product:2?value=mouse"` | | |
| 3 | 1, 2번을 `8084`로 한 번씩 더 | | 8084 캐시에도 같은 값 |
| 4 | `curl -X POST localhost:8083/ch08/pubsub/invalidate/product:1` | `받은 구독자 수: 2` | 8083에서 **한 번만** 방송 |
| 5 | `curl localhost:8083/ch08/pubsub/local-cache` | `{"product:2":"mouse"}` | product:1이 지워졌다 |
| 6 | `curl localhost:8084/ch08/pubsub/local-cache` | `{"product:2":"mouse"}` | **8084에서도** 지워졌다 |

터미널 1, 2(앱 로그)에 모두 `캐시 무효화 수신: product:1`이 찍힌다.

> Pub/Sub 채널은 DB 번호와 상관없이 Redis 전체에서 같이 쓴다.

---

## 2. 🔴 전달 보장 — 사라지나, 두 번 오나

메시지를 주고받는 방식은 실패했을 때 어떻게 되는지로 나뉜다.

| 방식 | 동작 | 실패하면 | 예 |
| ---- | ---- | -------- | -- |
| **at-most-once** (최대 한 번) | 보내고 끝. 받았는지 확인 안 한다 | **사라진다** (두 번 오진 않는다) | Redis Pub/Sub |
| **at-least-once** (최소 한 번) | "처리 완료" 표시가 올 때까지 메시지를 남겨 둔다 | **두 번 올 수 있다** (사라지진 않는다) | Redis Stream, Kafka |

**at-least-once에서 두 번 오는 이유**

```text
메시지 처리 (포인트 100 적립) → "처리 완료" 표시하기 직전에 서버가 죽음
서버 다시 켜짐 → 완료 표시가 없으니 같은 메시지를 또 처리 → 포인트 100 또 적립 ❌
```

그래서 받는 쪽은 **같은 메시지를 두 번 받아도 결과가 같게** 만든다. 이걸 **멱등성**(idempotent)이라고 한다. 예: 처리한 메시지 ID를 `SET processed:{id} 1 NX EX 86400`으로 기록하고, 이미 있으면 건너뛴다 (2장 NX).

| 상황 | 선택 |
| ---- | ---- |
| 놓쳐도 다음에 다시 맞춰지는 일 (로컬 캐시 지우기, "새 글 있음" 알림) | **Pub/Sub** |
| 놓치면 안 되는 일 (주문, 결제, 포인트) | **Kafka** (또는 Redis Stream) + 멱등 처리 |

---

## 3. 🟡 Stream — 메시지를 남기는 큐

> 실무에서 놓치면 안 되는 메시지는 보통 **Kafka** 같은 전용 도구를 쓴다. Stream은 **Redis만으로 가볍게** 하고 싶을 때 쓴다. 개념과 아래 실습 정도만 알면 된다.

| | Pub/Sub | Stream |
| --- | --- | --- |
| 메시지 저장 | ❌ | ✅ Redis에 남는다 |
| 꺼져 있던 서버 | 못 받는다 | 켜지면 **밀린 것부터** 받는다 |
| 서버 여러 대가 받으면 | **모두** 같은 메시지를 받는다 | **나눠서** 하나씩 받는다 |
| 처리 완료 확인 | ❌ | ✅ (`XACK`) |

### 용어 4개

| 용어 | 뜻 |
| ---- | -- |
| `XADD` | Stream에 메시지 추가. 메시지마다 ID가 붙는다 (`1793360498701-0` = 시각-순번) |
| **Consumer Group** | 메시지를 **나눠 받는** 서버들의 묶음. 같은 메시지를 두 서버가 받지 않는다 |
| `XACK` | "이 메시지 처리 끝났다" 표시 |
| **Pending 목록** | 받아 갔지만 아직 `XACK` 안 한 메시지 목록. 처리하다 실패하면 여기 남는다 |

⚠️ Pending 목록에 남은 메시지를 Redis가 **자동으로 다시 보내 주지는 않는다.** 다른 서버가 가져가서 다시 처리하는 코드를 **직접** 만들어야 한다. 이 실습의 `/reclaim` API가 그 역할이다.

### 🧪 실습 — 서버 2대로 주문 처리

`item=fail`인 주문은 일부러 처리 실패(`XACK` 안 함)하게 만들어 두었다. 1절의 서버 2대(8083, 8084)를 그대로 쓴다.

| 순서 | 요청 | 결과 | 확인할 것 |
| ---- | ---- | ---- | --------- |
| 1 | `for it in book pen fail cup; do curl -X POST "localhost:8083/ch08/stream/orders?item=$it"; echo; done` | 메시지 ID 4개 | 주문 4개 추가 |
| 2 | 터미널 1, 2 로그 보기 | `[8083] 주문 처리 ... item=book`<br>`[8084] 주문 처리 ... item=pen`<br>`[8083] 처리 실패 ... (PEL에 남음)`<br>`[8084] 주문 처리 ... item=cup` | 두 서버가 **나눠서** 처리 |
| 3 | `curl localhost:8083/ch08/stream/status` | `{"streamLength":4,"pendingTotal":1,"pendingByConsumer":{"consumer-8083":1}}` | 8083이 처리 못 한 1건이 남았다 |
| 4 | **5초 기다린 뒤** `curl -X POST localhost:8084/ch08/stream/reclaim` | `["1793360498755-0"]` | 8084가 가져가서 다시 처리하고 완료 표시 |
| 5 | `curl localhost:8083/ch08/stream/status` | `{...,"pendingTotal":0,...}` | 남은 것 없음 |

> `/reclaim`은 **5초 넘게 처리 안 된** 메시지만 가져온다. 5초 전에 부르면 `[]`. 바로 가져오면 다른 서버가 **지금 처리 중인** 메시지를 빼앗아 두 번 처리될 수 있기 때문이다.

**서버가 모두 꺼져 있을 때 보낸 메시지는?**

| 순서 | 명령 | 결과 | 확인할 것 |
| ---- | ---- | ---- | --------- |
| 1 | 터미널 1, 2에서 `Ctrl+C` | | 서버 모두 종료 |
| 2 | `docker exec -it redis-study redis-cli` 접속 후 `XADD stream:orders * item a` | ID | Stream에 남는다 |
| 3 | 같은 접속에서 `PUBLISH cache:invalidate product:2` | `(integer) 0` | Pub/Sub은 받은 사람 0 → 사라짐 |
| 4 | 터미널 1에서 8083 다시 시작 | 로그: `주문 처리 ... item=a` | Stream은 **밀린 메시지를 처리**했다 |

---

## 🎯 실습 문제

**문제 1 (CLI).** 채팅방이 여러 개다(`chat:room:1`, `chat:room:2` …). **모든 채팅방**의 메시지를 한 번에 듣는 구독을 만들고, 2번 방에 메시지를 보내 확인하라. 힌트: 패턴 구독 `PSUBSCRIBE`.

<details>
<summary>정답</summary>

| 터미널 | 입력 | 결과 |
| ------ | ---- | ---- |
| A | `PSUBSCRIBE chat:room:*` | 구독 시작 |
| B | `PUBLISH chat:room:2 hello` | `(integer) 1` |
| A 화면 | | `1) "pmessage"`<br>`2) "chat:room:*"` ← 내가 구독한 패턴<br>`3) "chat:room:2"` ← 실제 채널<br>`4) "hello"` |

</details>

**문제 2 (생각).** "주문 완료 → 포인트 적립" 이벤트를 Redis Pub/Sub으로 보내기로 했다. 무엇이 문제이고, 어떻게 바꿔야 할까?

<details>
<summary>정답</summary>

Pub/Sub은 저장하지 않아서, 포인트 서버가 재시작 중이던 순간의 이벤트는 **영영 사라진다.** 놓치면 안 되는 이벤트이므로 Kafka나 Redis Stream처럼 저장하는 방식을 쓴다. 그러면 두 번 올 수 있으니, 주문 ID로 이미 적립했는지 확인하는 **멱등 처리**를 같이 한다.

</details>

---

## 실무 주의

- 🔴 **Pub/Sub은 메시지가 사라질 수 있다.** 놓쳐도 되는 알림에만 쓴다.
- 저장하는 방식(Stream, Kafka)은 **두 번 올 수 있다.** 받는 쪽을 멱등하게 만든다.
- 🟢 Stream을 실무에서 쓴다면: 처리 안 된 메시지를 주기적으로 가져와 재처리하고(`XAUTOCLAIM`), 길이 제한(`MAXLEN`)을 둔다. 이 프로젝트의 주문 추가도 `MAXLEN ~ 10000`을 쓴다.

## 면접 한 줄

- **Pub/Sub**: 구독 중인 모든 클라이언트에 즉시 전달하지만 저장하지 않아 at-most-once다. 로컬 캐시 무효화처럼 유실돼도 되는 알림에 쓴다.
- **at-least-once**: 처리 완료를 확인할 때까지 메시지를 남겨 유실은 없지만 중복이 생길 수 있어, 받는 쪽을 멱등하게 만든다.
- **Stream**: 메시지를 저장하고 Consumer Group으로 나눠 처리한다. 완료 표시(ACK)를 안 한 메시지는 Pending 목록에 남고, 직접 가져와 재처리한다.

다음: [9장. 영속성](./09-persistence.md)
