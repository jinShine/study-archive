# 7장. Pipeline — 대량 처리

> **이 장을 마치면**: 명령 수천 개를 보낼 때 **수십 배 빠르게** 보내는 방법을 쓸 수 있고, 6장의 Lua와 무엇이 다른지 설명할 수 있다.

| 주제 | 한 줄 | 중요도 |
| ---- | ----- | ------ |
| Pipeline | 명령을 모아서 한 번에 보내고, 응답도 한 번에 받는다 | 🟡 대량 작업할 때 |

**실습 코드**: [ch07pipeline/PipelineController.java](./redis-practice/src/main/java/com/buzz/redis/ch07pipeline/PipelineController.java)

---

## 1. 느린 건 Redis가 아니라 "왕복"이다

명령 하나를 보내면 **응답이 올 때까지 기다렸다가** 다음 명령을 보낸다.

```text
앱 ── SET 1 ──▶ Redis
앱 ◀── OK ───── Redis       ← 여기까지가 "왕복" 1번
앱 ── SET 2 ──▶ Redis
앱 ◀── OK ───── Redis       ← 왕복 2번
...                          명령 1만 개 = 왕복 1만 번
```

Redis가 `SET`을 처리하는 시간은 아주 짧다. 대부분의 시간은 **네트워크를 오가는 시간**이다. 이 왕복 시간을 **RTT**(Round Trip Time)라고 한다.

## 2. Pipeline — 모아서 보내기

```text
앱 ── SET 1, SET 2, ..., SET 10000 ──▶ Redis       한 번에 보내고
앱 ◀── OK, OK, ..., OK ─────────────── Redis       한 번에 받는다
```

Redis가 하는 일은 같다. **오가는 횟수만** 줄어든다.

## 3. 🧪 Spring — 하나씩 vs Pipeline

```java
// 1. 하나씩: SET 1번 = 왕복 1번
for (int i = 0; i < count; i++) {
    redisTemplate.opsForValue().set("pipe:one:" + i, "v" + i);
}

// 2. Pipeline: 콜백 안에 넣은 명령을 모아서 한 번에 보낸다
List<Object> results = redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
    for (int i = 0; i < count; i++) {
        connection.stringCommands().set(bytes("pipe:batch:" + i), bytes("v" + i));
    }
    return null;   // 반드시 null. 결과는 executePipelined가 모아서 돌려준다
});
```

- 콜백 안의 `connection`은 문자열이 아니라 **바이트 배열**로 명령을 보낸다. `bytes(s)`는 `s.getBytes(UTF_8)`다.
- 콜백 안에서는 결과를 볼 수 없다 (아직 응답이 안 왔다). 결과는 **보낸 순서대로** `results`에 담긴다.

| 요청 | 결과 |
| ---- | ---- |
| `curl localhost:8083/ch07/compare` | `{"count":10000,"oneByOneMs":4158,"pipelineMs":77,...}` |

| SET 1만 번 | 걸린 시간 |
| ---------- | --------- |
| 하나씩 | 약 4.2초 |
| Pipeline | 약 0.07초 (**약 60배 빠름**) |

> 시간은 PC마다 다르다. "몇 배 차이 나는가"를 본다.

## 4. 🔴 Lua와 헷갈리지 않기

둘 다 "명령 여러 개를 한 번에"처럼 보이지만 목적이 다르다.

| | Pipeline | Lua (6장) |
| --- | --- | --- |
| 목적 | **빨리** 보내기 (왕복 줄이기) | **끼어들지 못하게** 실행 |
| 실행 중 다른 요청이 끼어드나 | 끼어든다 | 못 끼어든다 |
| 앞 명령 결과를 보고 다음 명령을 정하나 | 못 한다 (결과는 마지막에 한꺼번에 온다) | 한다 (`if`) |
| 쓰는 곳 | 캐시 미리 채우기, 대량 저장, 대량 삭제 | 재고 차감, 쿠폰 발급 |

"재고가 있으면 차감"처럼 **앞 결과를 보고 판단해야 하면** Pipeline으로는 안 된다.

## 5. 실무에서

- **캐시 미리 채우기**: 배포 직후에는 캐시가 비어 있어 첫 요청들이 DB로 몰린다. 인기 상품 수천 개를 미리 넣을 때 Pipeline을 쓴다.
- 한 번에 수십만 개를 보내면 응답을 모아 두느라 메모리를 많이 쓴다. **수천 개씩 나눠서** 보낸다.

---

## 🎯 실습 문제

**문제 1 (Spring).** 상품 1000개를 캐시에 미리 넣는다. 키는 `warmup:product:{번호}`, 값은 `name-{번호}`, **TTL 10분**. Pipeline 한 번으로 해 보라.

<details>
<summary>정답</summary>

```java
redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
    for (int i = 1; i <= 1000; i++) {
        connection.stringCommands().setEx(bytes("warmup:product:" + i), 600, bytes("name-" + i));   // SET ... EX 600
    }
    return null;
});
```

`setEx` = 저장과 만료(초)를 한 번에. 프로젝트의 `POST /ch07/warmup`이 이 코드다.

| 확인 | 결과 |
| ---- | ---- |
| `curl -X POST localhost:8083/ch07/warmup` | `{"ms":54,"count":1000}` |
| redis-cli에서 `GET warmup:product:1000` | `"name-1000"` |
| redis-cli에서 `TTL warmup:product:1` | `(integer) 600` 이하 |

</details>

**문제 2 (생각).** Pipeline으로 보낸 1000개 중 500번째 명령이 에러가 났다. 나머지는 어떻게 될까?

<details>
<summary>정답</summary>

나머지는 그대로 실행된다. Pipeline은 **보내는 것만 모아서** 하는 것이라 되돌리기도, 끼어들기 방지도 없다. 결과 목록에서 명령별로 성공, 실패를 확인한다.

</details>

---

## 면접 한 줄

- **Pipeline**: 여러 명령을 한 번에 보내고 응답을 한 번에 받아 네트워크 왕복 횟수를 줄인다. 원자성이 없어서 서로 관계없는 대량 작업에 쓴다.

다음: [8장. 메시징](./08-messaging.md)
